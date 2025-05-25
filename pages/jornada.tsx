import { useEffect, useState } from 'react'

type EstadoJornada = {
  inicio?: string
  salida_almuerzo?: string
  regreso_almuerzo?: string
  fin?: string
}

export default function JornadaPage() {
  const [estado, setEstado] = useState<EstadoJornada>({})
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const registrar = async (tipo: 'inicio' | 'salida-almuerzo' | 'regreso-almuerzo' | 'fin') => {
    setMensaje('')
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/jornada/${tipo}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error desconocido')
      } else {
        setMensaje(data.mensaje || 'Acción realizada')
        await obtenerEstado()
      }
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const obtenerEstado = async () => {
    try {
      const res = await fetch('/api/jornada/estado')
      const data = await res.json()
      if (res.ok) {
        setEstado(data)
      }
    } catch {
      // no manejar error aquí
    }
  }

  useEffect(() => {
    obtenerEstado()
  }, [])

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h2>Control de Jornada</h2>

      <div style={{ marginBottom: 16 }}>
        <p><strong>Inicio:</strong> {estado.inicio || 'No registrado'}</p>
        <p><strong>Salida a almuerzo:</strong> {estado.salida_almuerzo || 'No registrado'}</p>
        <p><strong>Regreso de almuerzo:</strong> {estado.regreso_almuerzo || 'No registrado'}</p>
        <p><strong>Fin de jornada:</strong> {estado.fin || 'No registrado'}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => registrar('inicio')} disabled={!!estado.inicio || loading}>
          Iniciar Jornada
        </button>
        <button
          onClick={() => registrar('salida-almuerzo')}
          disabled={!estado.inicio || !!estado.salida_almuerzo || loading}
        >
          Salida a Almuerzo
        </button>
        <button
          onClick={() => registrar('regreso-almuerzo')}
          disabled={!estado.salida_almuerzo || !!estado.regreso_almuerzo || loading}
        >
          Regreso de Almuerzo
        </button>
        <button
          onClick={() => registrar('fin')}
          disabled={!estado.inicio || !!estado.fin || loading}
        >
          Finalizar Jornada
        </button>
      </div>

      {mensaje && <p style={{ color: 'green', marginTop: 16 }}>{mensaje}</p>}
      {error && <p style={{ color: 'red', marginTop: 16 }}>{error}</p>}
    </div>
  )
}
