'use client'

import { GetServerSideProps } from 'next'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { useState } from 'react'

type Moneda = {
  id: string
  codigo: string
  nombre: string
}

type Punto = {
  id: string
  nombre: string
}

type Props = {
  monedas: Moneda[]
  puntos: Punto[]
}

export default function TransferenciasPage({ monedas, puntos }: Props) {
  const [monedaId, setMonedaId] = useState('')
  const [monto, setMonto] = useState('')
  const [haciaPuntoId, setHaciaPuntoId] = useState('')
  const [observacion, setObservacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const enviarTransferencia = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    if (!monedaId || !monto || !haciaPuntoId) {
      setError('Todos los campos son obligatorios')
      return
    }

    try {
      const res = await fetch('/api/transferencias/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moneda_id: monedaId,
          monto: parseFloat(monto),
          hacia_punto_id: haciaPuntoId,
          observacion,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al registrar la transferencia')

      setMensaje('✅ Transferencia registrada con éxito')
      setMonedaId('')
      setMonto('')
      setHaciaPuntoId('')
      setObservacion('')
   } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message)
  } else {
    setError('❌ No se pudo registrar la transferencia')
  }
}
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>💸 Transferencia de divisas</h1>

      <form onSubmit={enviarTransferencia} style={{ maxWidth: 500, marginTop: 30 }}>
        <div>
          <label>Moneda:</label>
          <select
            value={monedaId}
            onChange={(e) => setMonedaId(e.target.value)}
            required
          >
            <option value="">Seleccionar moneda</option>
            {monedas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codigo} - {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 20 }}>
          <label>Monto:</label>
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <label>Punto de destino:</label>
          <select
            value={haciaPuntoId}
            onChange={(e) => setHaciaPuntoId(e.target.value)}
            required
          >
            <option value="">Seleccionar punto</option>
            {puntos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 20 }}>
          <label>Observación:</label>
          <input
            type="text"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <button type="submit" style={{ marginTop: 30 }}>
          ➕ Enviar transferencia
        </button>
      </form>

      {mensaje && <p style={{ color: 'green', marginTop: 20 }}>{mensaje}</p>}
      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)

  if (!usuario || !usuario.punto_atencion_id) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const monedas = await prisma.moneda.findMany({
    select: {
      id: true,
      codigo: true,
      nombre: true,
    },
    orderBy: { codigo: 'asc' },
  })

  const puntos = await prisma.puntoAtencion.findMany({
    where: {
      id: { not: usuario.punto_atencion_id },
    },
    select: {
      id: true,
      nombre: true,
    },
    orderBy: { nombre: 'asc' },
  })

  return {
    props: {
      monedas,
      puntos,
    },
  }
}
