'use client'

import { useEffect, useState } from 'react'
import { type PuntoAtencion } from '@/shared/types'

interface Props {
  punto: PuntoAtencion
  onClose: () => void
  onSave: () => void
}

export default function ModalEditarPunto({ punto, onClose, onSave }: Props) {
  const [form, setForm] = useState(punto)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('🟡 Modal de edición montado')
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    console.log('📤 Enviando datos de edición:', form)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/puntos-atencion/editar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('❌ Error al editar:', data)
        setError(data.error || 'Error al editar el punto de atención')
        return
      }

      console.log('✅ Punto de atención editado correctamente')
      onSave()
      onClose()
    } catch (err) {
      console.error('❌ Error de red:', err)
      setError('Error de red al editar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
        <h3 className="text-lg font-bold text-yellow-600">Editar Punto de Atención</h3>

        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          className="w-full border p-2 rounded"
        />
        <input
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          placeholder="Dirección"
          className="w-full border p-2 rounded"
        />
        <input
          name="ciudad"
          value={form.ciudad}
          onChange={handleChange}
          placeholder="Ciudad"
          className="w-full border p-2 rounded"
        />
        <input
          name="provincia"
          value={form.provincia}
          onChange={handleChange}
          placeholder="Provincia"
          className="w-full border p-2 rounded"
        />
        <input
          name="codigoPostal"
          value={form.codigoPostal}
          onChange={handleChange}
          placeholder="Código Postal"
          className="w-full border p-2 rounded"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
