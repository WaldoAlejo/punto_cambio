'use client'

import { type PuntoAtencion } from '@/shared/types'

interface Props {
  punto: PuntoAtencion
  onClose: () => void
  onSave: () => Promise<void>
}

export default function ModalInactivarPunto({ punto, onClose, onSave }: Props) {
  const handleInactivar = async () => {
    const res = await fetch(`/api/admin/puntos-atencion/${punto.id}/inactivar`, {
      method: 'PUT',
    })

    if (res.ok) {
      await onSave()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">¿Inactivar Punto de Atención?</h2>
        <p>Esta acción desactivará el punto <strong>{punto.nombre}</strong>.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
          <button onClick={handleInactivar} className="bg-red-600 text-white px-4 py-2 rounded">Inactivar</button>
        </div>
      </div>
    </div>
  )
}
