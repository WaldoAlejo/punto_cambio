import { useEffect, useState } from 'react'

type Cuadre = {
  entradas: number
  salidas: number
  saldo: number
  observaciones: string
  razonParcial?: string | null
} | null

export function useCuadreCajaHoy() {
  const [cuadre, setCuadre] = useState<Cuadre>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCuadre = async () => {
      try {
        const res = await fetch('/api/cuadre/hoy')
        if (!res.ok) throw new Error('Error al obtener el cuadre')
        const data = await res.json()

        if (
          typeof data.entradas === 'number' &&
          typeof data.salidas === 'number' &&
          typeof data.saldo === 'number' &&
          typeof data.observaciones === 'string'
        ) {
          setCuadre({
            entradas: data.entradas,
            salidas: data.salidas,
            saldo: data.saldo,
            observaciones: data.observaciones,
            razonParcial: data.razonParcial ?? null,
          })
        } else {
          console.warn('Formato de datos inesperado:', data)
          setCuadre(null)
        }
      } catch (error) {
        console.error('Error al obtener el cuadre de caja:', error)
        setCuadre(null)
      } finally {
        setLoading(false)
      }
    }

    fetchCuadre()
  }, [])

  return { cuadre, loading }
}
