import React, { useState } from 'react'
import { Usuario } from '@/shared/types'

interface Props {
  usuario: Usuario
  onClose: () => void
  onSave: () => Promise<void>
}

export default function ModalEditarUsuario({ usuario, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState(usuario.nombre)
  const [username, setUsername] = useState(usuario.username)
  const [rol, setRol] = useState<'ADMIN' | 'OPERADOR'>(usuario.rol)

  const handleGuardar = async () => {
    try {
      const res = await fetch('/api/admin/editar-usuario', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: usuario.id, nombre, username, rol }),
      })

      if (res.ok) {
        await onSave()
        onClose()
      }
    } catch (err) {
      console.error('Error al editar usuario:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
        <input className="border p-2 mb-2 w-full rounded" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
        <input className="border p-2 mb-2 w-full rounded" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
        <select className="border p-2 mb-4 w-full rounded" value={rol} onChange={(e) => setRol(e.target.value as 'ADMIN' | 'OPERADOR')}>
          <option value="OPERADOR">OPERADOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300">Cancelar</button>
          <button onClick={handleGuardar} className="px-4 py-2 rounded bg-blue-600 text-white">Guardar</button>
        </div>
      </div>
    </div>
  )
}