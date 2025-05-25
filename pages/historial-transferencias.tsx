import { useEffect, useState } from 'react'

type Transferencia = {
  id: string
  monto: number
  moneda: string
  destino: string
  fecha: string
  observacion: string
}

export default function HistorialTransferenciasPage() {
  const [data, setData] = useState<Transferencia[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transferencias/historial')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(() => setError('Error al cargar historial'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: 24 }}>
      <h2>📄 Historial de Transferencias</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : data.length === 0 ? (
        <p>No hay transferencias registradas.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc' }}>Fecha</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Moneda</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Monto</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Destino</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Observación</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.fecha).toLocaleString()}</td>
                <td>{t.moneda}</td>
                <td>{t.monto.toFixed(2)}</td>
                <td>{t.destino}</td>
                <td>{t.observacion || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
