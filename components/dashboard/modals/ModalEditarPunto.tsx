'use client'

import { Dialog } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { type PuntoAtencion } from '@/shared/types'

interface Props {
  punto: PuntoAtencion
  onClose: () => void
  onSave: () => void
}

export default function ModalEditarPunto({ punto, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState(punto.nombre)
  const [direccion, setDireccion] = useState(punto.direccion)
  const [ciudad, setCiudad] = useState(punto.ciudad)
  const [provincia, setProvincia] = useState(punto.provincia)
  const [codigoPostal, setCodigoPostal] = useState(punto.codigoPostal)

  const handleGuardar = async () => {
    try {
      const res = await fetch(`/api/puntos-atencion/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: punto.id,
          nombre,
          direccion,
          ciudad,
          provincia,
          codigoPostal,
        }),
      })

      if (res.ok) {
        onSave()
        onClose()
      }
    } catch (err) {
      console.error('Error al guardar cambios:', err)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} as={Fragment}>
      <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 space-y-4">
          <Dialog.Title className="text-xl font-bold text-gray-800">Editar Punto de Atención</Dialog.Title>

          <div className="space-y-3">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-yellow-300"
            />
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección"
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-yellow-300"
            />
            <input
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ciudad"
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-yellow-300"
            />
            <input
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              placeholder="Provincia"
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-yellow-300"
            />
            <input
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              placeholder="Código Postal"
              className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:ring-yellow-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Guardar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
