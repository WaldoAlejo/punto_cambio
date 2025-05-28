'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onSave: () => Promise<void>
}

export default function ModalCrearPunto({ onClose, onSave }: Props) {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/puntos-atencion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear punto')
      } else {
        await onSave()
        onClose()
      }
    } catch (err) {
      console.error('Error al crear punto:', err)
      setError('Error de red')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
        <h3 className="text-lg font-semibold">Crear Nuevo Punto de Atención</h3>
        <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="border w-full p-2 rounded" />
        <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Dirección" className="border w-full p-2 rounded" />
        <input name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Ciudad" className="border w-full p-2 rounded" />
        <input name="provincia" value={form.provincia} onChange={handleChange} placeholder="Provincia" className="border w-full p-2 rounded" />
        <input name="codigoPostal" value={form.codigoPostal} onChange={handleChange} placeholder="Código Postal" className="border w-full p-2 rounded" />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-yellow-500 text-white rounded">
            {loading ? 'Guardando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}
