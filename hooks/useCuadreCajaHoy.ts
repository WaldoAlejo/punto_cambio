// hooks/useCuadreCajaHoy.ts
import { useEffect, useState } from 'react'

type Cuadre = {
  entradas: number
  salidas: number
  saldo: number
  observaciones: string
} | null

export function useCuadreCajaHoy() {
  const [cuadre, setCuadre] = useState<Cuadre>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cuadre/hoy')
      .then((res) => res.json())
      .then(setCuadre)
      .finally(() => setLoading(false))
  }, [])

  return { cuadre, loading }
}
