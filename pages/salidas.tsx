'use client'

import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { Moneda } from '@prisma/client'
import LogoutButton from '@/components/LogoutButton'
import { formatInTimeZone } from 'date-fns-tz'

interface Props {
  monedas: Moneda[]
}

interface Salida {
  id: string
  fecha: string
  monto: number
  descripcion: string | null
  moneda: {
    codigo: string
  }
}

export default function SalidasPage({ monedas }: Props) {
  const [form, setForm] = useState({ monto: '', monedaId: '', descripcion: '' })
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [salidas, setSalidas] = useState<Salida[]>([])

  const cargarSalidas = async () => {
    try {
      const res = await fetch('/api/salida/listar')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSalidas(data)
    } catch (err) {
      console.error('Error al cargar salidas:', err)
    }
  }

  useEffect(() => {
    cargarSalidas()
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
      const res = await fetch('/api/salida/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto, monedaId: form.monedaId, descripcion: form.descripcion }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al registrar salida')

      setMensaje('Salida registrada con éxito')
      setForm({ monto: '', monedaId: '', descripcion: '' })
      cargarSalidas()
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
      <h1>Registrar Salida</h1>

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

        <button type="submit" style={{ marginTop: 12 }}>Registrar salida</button>
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {salidas.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2>Historial de Salidas</h2>
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
              {salidas.map((s) => (
                <tr key={s.id}>
                  <td>{formatInTimeZone(s.fecha, 'America/Guayaquil', 'dd/MM/yyyy HH:mm:ss')}</td>
                  <td>{s.moneda.codigo}</td>
                  <td>{s.monto.toFixed(2)}</td>
                  <td>{s.descripcion || '-'}</td>
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
