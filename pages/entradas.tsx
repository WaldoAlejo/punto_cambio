'use client'

import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { Moneda } from '@prisma/client'
import LogoutButton from '@/components/LogoutButton'
import { format } from 'date-fns'

interface Props {
  monedas: Moneda[]
}

interface Entrada {
  id: string
  fecha: string
  monto: number
  descripcion: string | null
  moneda: {
    codigo: string
  }
}

export default function EntradasPage({ monedas }: Props) {
  const [form, setForm] = useState({ monto: '', monedaId: '', descripcion: '' })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [entradas, setEntradas] = useState<Entrada[]>([])

  const cargarEntradas = async () => {
    try {
      const res = await fetch('/api/entrada/listar')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEntradas(data)
    } catch (err) {
      console.error('Error al cargar entradas:', err)
    }
  }

  useEffect(() => {
    cargarEntradas()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    const monto = parseFloat(form.monto)
    if (!monto || !form.monedaId) {
      setError('Debes completar todos los campos')
      return
    }

    try {
      const res = await fetch('/api/entrada/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto, monedaId: form.monedaId, descripcion: form.descripcion }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar entrada')

      setMensaje('Entrada registrada con éxito')
      setForm({ monto: '', monedaId: '', descripcion: '' })
      cargarEntradas()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <LogoutButton />
      <h1>Registrar Entrada</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div>
          <label>Monto:</label>
          <input
            type="number"
            step="0.01"
            value={form.monto}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Moneda:</label>
          <select
            value={form.monedaId}
            onChange={(e) => setForm({ ...form, monedaId: e.target.value })}
            required
          >
            <option value="">Seleccione</option>
            {monedas.map((m) => (
              <option key={m.id} value={m.id}>{m.codigo}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Descripción:</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        <button type="submit" style={{ marginTop: 12 }}>Registrar entrada</button>
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {entradas.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2>Historial de Entradas</h2>
          <table border={1} cellPadding={8} style={{ marginTop: 10, width: '100%' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Moneda</th>
                <th>Monto</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((e) => (
                <tr key={e.id}>
                  <td>{format(new Date(e.fecha), 'dd/MM/yyyy HH:mm:ss')}</td>
                  <td>{e.moneda.codigo}</td>
                  <td>{e.monto.toFixed(2)}</td>
                  <td>{e.descripcion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)
  if (!usuario || !usuario.punto_atencion_id) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const monedas = await prisma.moneda.findMany({})
  return {
    props: { monedas },
  }
}
