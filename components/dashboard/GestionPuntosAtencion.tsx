'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import { type PuntoAtencion } from '@/shared/types'
import ModalCrearPunto from './modals/ModalCrearPunto'
import ModalEditarPunto from './modals/ModalEditarPunto'
import ModalInactivarPunto from './modals/ModalInactivarPunto'

export default function GestionPuntosAtencion() {
  const [puntos, setPuntos] = useState<PuntoAtencion[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [puntoEditar, setPuntoEditar] = useState<PuntoAtencion | null>(null)
  const [puntoInactivar, setPuntoInactivar] = useState<PuntoAtencion | null>(null)

  const obtenerPuntos = async () => {
    try {
      const res = await fetch('/api/puntos-atencion/listar-puntos')
      const data = await res.json()
      setPuntos(data)
    } catch (err) {
      console.error('Error al obtener puntos:', err)
    }
  }

  useEffect(() => {
    obtenerPuntos()
  }, [])

  const puntosFiltrados = puntos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-yellow-600">Puntos de Atención</h2>
        <button
          onClick={() => setModalCrearAbierto(true)}
          className="bg-yellow-500 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-yellow-600"
        >
          <PlusCircle size={18} />
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border p-2 rounded shadow-sm"
      />

      <table className="w-full text-left border border-gray-300 shadow-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Dirección</th>
            <th className="p-2 border">Ciudad</th>
            <th className="p-2 border">Provincia</th>
            <th className="p-2 border">Código Postal</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {puntosFiltrados.map((punto) => (
            <tr key={punto.id} className="hover:bg-gray-50">
              <td className="p-2 border">{punto.nombre}</td>
              <td className="p-2 border">{punto.direccion}</td>
              <td className="p-2 border">{punto.ciudad}</td>
              <td className="p-2 border">{punto.provincia}</td>
              <td className="p-2 border">{punto.codigoPostal}</td>
              <td className="p-2 border space-x-2">
                <button
                  title="Editar"
                  onClick={() => setPuntoEditar(punto)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Pencil size={18} />
                </button>
                <button
                  title="Inactivar"
                  onClick={() => setPuntoInactivar(punto)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modales */}
      {modalCrearAbierto && (
        <ModalCrearPunto
          onClose={() => setModalCrearAbierto(false)}
          onSave={obtenerPuntos}
        />
      )}

      {puntoEditar && (
        <ModalEditarPunto
          punto={puntoEditar}
          onClose={() => setPuntoEditar(null)}
          onSave={obtenerPuntos}
        />
      )}

      {puntoInactivar && (
        <ModalInactivarPunto
          punto={puntoInactivar}
          onClose={() => setPuntoInactivar(null)}
          onSave={obtenerPuntos}
        />
      )}
    </div>
  )
}
 