import { useState } from 'react'
import { useRouter } from 'next/router'

export default function CuadreCajaPage() {
  const [entradas, setEntradas] = useState('')
  const [salidas, setSalidas] = useState('')
  const [saldoFinal, setSaldoFinal] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [razonParcial, setRazonParcial] = useState('') // ✅ Campo adicional
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setError('')

    const res = await fetch('/api/cuadre/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_entradas: parseFloat(entradas),
        total_salidas: parseFloat(salidas),
        saldo_final: parseFloat(saldoFinal),
        observaciones,
        razonParcial: razonParcial || null,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al registrar cuadre')
    } else {
      setMensaje(data.mensaje)
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h2>🧾 Cuadre de Caja Diario</h2>
      <form onSubmit={handleSubmit}>
        <label>Total Entradas:</label>
        <input
          type="number"
          value={entradas}
          onChange={(e) => setEntradas(e.target.value)}
          required
          step="0.01"
        />

        <label>Total Salidas:</label>
        <input
          type="number"
          value={salidas}
          onChange={(e) => setSalidas(e.target.value)}
          required
          step="0.01"
        />

        <label>Saldo Final:</label>
        <input
          type="number"
          value={saldoFinal}
          onChange={(e) => setSaldoFinal(e.target.value)}
          required
          step="0.01"
        />

        <label>Observaciones (opcional):</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />

        <label>Razón de cuadre parcial (opcional):</label>
        <input
          type="text"
          placeholder="Ej: Cambio de turno, salida anticipada..."
          value={razonParcial}
          onChange={(e) => setRazonParcial(e.target.value)}
        />

        <button type="submit" style={{ marginTop: 16 }}>Registrar Cuadre</button>
      </form>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
