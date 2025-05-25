import { useEffect, useState } from 'react'

export function useEstadoJornada() {
  const [estado, setEstado] = useState<{
    inicio?: string
    salida_almuerzo?: string
    regreso_almuerzo?: string
    fin?: string
  }>({})
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const fetchEstado = async () => {
    try {
      const res = await fetch('/api/jornada/estado')
      const data = await res.json()
      if (res.ok) setEstado(data)
    } catch {
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
      if (!res.ok) throw new Error(data.error)
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
