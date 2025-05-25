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
  const [haciaPunto, setHaciaPunto] = useState('')
  const [observacion, setObservacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const enviarTransferencia = async () => {
    setMensaje('')
    setError('')

    try {
      const res = await fetch('/api/transferencias/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moneda_id: monedaId,
          monto: parseFloat(monto),
          hacia_punto: haciaPunto,
          observacion,
        }),
      })

      if (!res.ok) throw new Error('Error al registrar la transferencia')

      setMensaje('✅ Transferencia registrada con éxito')
      setMonedaId('')
      setMonto('')
      setHaciaPunto('')
      setObservacion('')
    } catch {
      setError('❌ No se pudo registrar la transferencia')
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>💸 Transferencia de divisas</h1>

      <div style={{ marginTop: 30 }}>
        <label>Moneda:</label>
        <select value={monedaId} onChange={(e) => setMonedaId(e.target.value)}>
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
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Punto de destino:</label>
        <select value={haciaPunto} onChange={(e) => setHaciaPunto(e.target.value)}>
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
        />
      </div>

      <button onClick={enviarTransferencia} style={{ marginTop: 30 }}>
        ➕ Enviar transferencia
      </button>

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

  const monedas = await prisma.monedas.findMany({
    select: {
      id: true,
      codigo: true,
      nombre: true,
    },
    orderBy: { codigo: 'asc' },
  })

  const puntos = await prisma.puntos_atencion.findMany({
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
