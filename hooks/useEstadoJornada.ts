import { useEffect, useState } from 'react'

interface EstadoJornada {
  inicio: string | null
  salida_almuerzo: string | null
  regreso_almuerzo: string | null
  fin: string | null
}

export function useEstadoJornada() {
  const [estado, setEstado] = useState<EstadoJornada>({
    inicio: null,
    salida_almuerzo: null,
    regreso_almuerzo: null,
    fin: null,
  })

  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const fetchEstado = async () => {
    try {
      const res = await fetch('/api/jornada/estado')
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al obtener jornada')

      setEstado({
        inicio: data.inicio || null,
        salida_almuerzo: data.salida_almuerzo || null,
        regreso_almuerzo: data.regreso_almuerzo || null,
        fin: data.fin || null,
      })
    } catch (err) {
      console.error(err)
      setError('No se pudo obtener estado de jornada')
    }
  }

  const registrar = async (accion: string) => {
    setLoading(true)
    setMensaje('')
    setError('')
    try {
      const res = await fetch(`/api/jornada/${accion}`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al registrar acción')

      setMensaje(data.mensaje)
      await fetchEstado()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Ocurrió un error inesperado')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstado()
  }, [])

  return { estado, registrar, mensaje, error, loading }
}
