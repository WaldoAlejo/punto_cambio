import React, { useState } from 'react'
import { Usuario } from '@/shared/types'

interface Props {
  usuario: Usuario
  onClose: () => void
  onSave: () => Promise<void>
}

export default function ModalResetearClave({ usuario, onClose, onSave }: Props) {
  const [clave, setClave] = useState('')

  const handleReset = async () => {
    try {
      const res = await fetch('/api/admin/resetear-clave', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuario.id, clave }),
      })

      if (res.ok) {
        await onSave()
        onClose()
      }
    } catch (err) {
      console.error('Error al resetear clave:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Resetear Clave</h3>
        <input className="border p-2 mb-4 w-full rounded" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Nueva Clave" type="password" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">Cancelar</button>
          <button onClick={handleReset} className="px-4 py-2 rounded bg-gray-800 text-white">Guardar</button>
        </div>
      </div>
    </div>
  )
}
