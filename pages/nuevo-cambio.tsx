// pages/nuevo-cambio.tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { useState } from 'react'
import { useRouter } from 'next/router'

type Moneda = {
  id: string
  codigo: string
  nombre: string
}

type Props = {
  usuario: {
    userId: string
    punto_atencion_id: string
  }
  monedas: Moneda[]
}

export default function NuevoCambio({ usuario: _usuario, monedas }: Props) {
  const router = useRouter()

  const [tipo, setTipo] = useState<'COMPRA' | 'VENTA'>('COMPRA')
  const [monedaOrigen, setMonedaOrigen] = useState('')
  const [monedaDestino, setMonedaDestino] = useState('')
  const [montoOrigen, setMontoOrigen] = useState('')
  const [tasaCambio, setTasaCambio] = useState('')
  const [montoDestino, setMontoDestino] = useState('')
  const [observacion, setObservacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false)

  const normalizarDecimal = (valor: string) =>
    valor.replace(',', '.').replace(/[^0-9.]/g, '')

  const calcularMonto = () => {
    setError('')
    setMensaje('')
    setMostrarVistaPrevia(false)

    if (monedaOrigen === monedaDestino) {
      setError('La moneda de origen y destino no pueden ser iguales.')
      return
    }

    const monto = parseFloat(normalizarDecimal(montoOrigen))
    const tasa = parseFloat(normalizarDecimal(tasaCambio))

    if (!monto || !tasa || isNaN(monto) || isNaN(tasa)) {
      setError('Debe ingresar valores válidos para monto y tasa.')
      setMontoDestino('')
      return
    }

    const resultado = tipo === 'COMPRA' ? monto * tasa : monto / tasa
    setMontoDestino(resultado.toFixed(2))
    setMostrarVistaPrevia(true)
  }

  const registrarCambio = async () => {
    setError('')
    setMensaje('')

    const res = await fetch('/api/nuevo-cambio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoOperacion: tipo,
        monedaOrigen,
        monedaDestino,
        montoOrigen: normalizarDecimal(montoOrigen),
        tasaCambio: normalizarDecimal(tasaCambio),
        observacion,
      }),
    })

    const data = await res.json()
    if (res.ok && data.id) {
      router.push(`/recibo/${data.id}`)
    } else {
      setError(data.error || 'Error al registrar cambio.')
    }
  }

  const getMonedaTexto = (id: string) =>
    monedas.find((m) => m.id === id)?.codigo || '---'

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Registrar Cambio de Divisas</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Tipo de operación:
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as 'COMPRA' | 'VENTA')
              setMostrarVistaPrevia(false)
            }}
          >
            <option value="COMPRA">COMPRA</option>
            <option value="VENTA">VENTA</option>
          </select>
        </label>
        <br />

        <label>
          Moneda Origen:
          <select
            value={monedaOrigen}
            onChange={(e) => {
              setMonedaOrigen(e.target.value)
              setMostrarVistaPrevia(false)
            }}
            required
          >
            <option value="">Seleccione</option>
            {monedas.map((m: Moneda) => (
              <option key={m.id} value={m.id}>
                {m.codigo} - {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Moneda Destino:
          <select
            value={monedaDestino}
            onChange={(e) => {
              setMonedaDestino(e.target.value)
              setMostrarVistaPrevia(false)
            }}
            required
          >
            <option value="">Seleccione</option>
            {monedas.map((m: Moneda) => (
              <option key={m.id} value={m.id} disabled={m.id === monedaOrigen}>
                {m.codigo} - {m.nombre}
              </option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Monto entregado:
          <input
            type="text"
            value={montoOrigen}
            onChange={(e) => {
              setMontoOrigen(e.target.value)
              setMostrarVistaPrevia(false)
            }}
            required
          />
        </label>
        <br />

        <label>
          Tasa negociada:
          <input
            type="text"
            value={tasaCambio}
            onChange={(e) => {
              setTasaCambio(e.target.value)
              setMostrarVistaPrevia(false)
            }}
            required
          />
        </label>
        <br />

        <label>
          Observación (opcional):
          <input
            type="text"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
          />
        </label>
        <br />

        <button type="button" onClick={calcularMonto}>
          Calcular monto destino
        </button>
      </form>

      {mostrarVistaPrevia && (
        <>
          <hr style={{ margin: '2rem 0' }} />
          <h2>Vista previa del cambio</h2>
          <p>
            <strong>Tipo:</strong> {tipo}
          </p>
          <p>
            <strong>Moneda origen:</strong> {getMonedaTexto(monedaOrigen)}
          </p>
          <p>
            <strong>Moneda destino:</strong> {getMonedaTexto(monedaDestino)}
          </p>
          <p>
            <strong>Monto entregado:</strong> {normalizarDecimal(montoOrigen)}
          </p>
          <p>
            <strong>Tasa negociada:</strong> {normalizarDecimal(tasaCambio)}
          </p>
          <p>
            <strong>Monto destino:</strong> 💰 {montoDestino}
          </p>
          {observacion && (
            <p>
              <strong>Observación:</strong> {observacion}
            </p>
          )}
          <br />
          <button onClick={registrarCambio}>Confirmar y Registrar Cambio</button>
          <button
            style={{ marginLeft: 10 }}
            onClick={() => setMostrarVistaPrevia(false)}
          >
            🗑️ Editar
          </button>
        </>
      )}

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
    orderBy: { nombre: 'asc' },
  })

  return {
    props: {
      usuario,
      monedas: monedas.map((m: Moneda) => ({
        id: m.id,
        codigo: m.codigo,
        nombre: m.nombre,
      })),
    },
  }
}
