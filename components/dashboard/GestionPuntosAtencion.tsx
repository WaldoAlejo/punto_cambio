'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import { type PuntoAtencion } from '@/shared/types'
import ModalCrearPunto from './modals/ModalCrearPunto'
import ModalEditarPunto from './modals/ModalEditarPunto'
import ModalPruebaInactivar from './modals/ModalInactivarPunto'

export default function GestionPuntosAtencion() {
  const [puntos, setPuntos] = useState<PuntoAtencion[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [puntoEditar, setPuntoEditar] = useState<PuntoAtencion | null>(null)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [puntoInactivar, setPuntoInactivar] = useState<PuntoAtencion | null>(null)

  const obtenerPuntos = async () => {
    console.log('🔄 Obteniendo puntos de atención...')
    try {
      const res = await fetch('/api/puntos-atencion/listar-puntos')
      if (!res.ok) {
        const error = await res.json()
        console.error('❌ Error al obtener puntos:', error)
        return
      }
      const data = await res.json()
      console.log('✅ Puntos obtenidos:', data)
      setPuntos(data)
    } catch (err) {
      console.error('❌ Error inesperado:', err)
    }
  }

  useEffect(() => {
    obtenerPuntos()
  }, [])

  const handleEditar = (punto: PuntoAtencion) => {
    console.log('✏️ Editar punto:', punto)
    setPuntoEditar(punto)
    setMostrarModalEditar(true)
  }

  const handleInactivar = (punto: PuntoAtencion) => {
    console.log('🛑 Inactivar punto:', punto)
    setPuntoInactivar(punto)
  }

  const handleCrear = () => {
    console.log('➕ Mostrar modal de creación')
    setModalCrearAbierto(true)
  }

  const puntosFiltrados = puntos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-yellow-600">Puntos de Atención</h2>
        <button
          onClick={handleCrear}
          className="bg-yellow-500 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-yellow-600"
        >
          <PlusCircle size={18} />
          Crear nuevo
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border p-2 rounded shadow-sm focus:outline-none focus:ring focus:ring-yellow-300"
      />

      <div className="overflow-auto rounded shadow-sm border">
        <table className="min-w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3 border">Nombre</th>
              <th className="p-3 border">Dirección</th>
              <th className="p-3 border">Ciudad</th>
              <th className="p-3 border">Provincia</th>
              <th className="p-3 border">Código Postal</th>
              <th className="p-3 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {puntosFiltrados.map((punto) => (
              <tr key={punto.id} className="hover:bg-gray-50 transition">
                <td className="p-3 border">{punto.nombre}</td>
                <td className="p-3 border">{punto.direccion}</td>
                <td className="p-3 border">{punto.ciudad}</td>
                <td className="p-3 border">{punto.provincia}</td>
                <td className="p-3 border">{punto.codigoPostal}</td>
                <td className="p-3 border text-center space-x-2">
                  <button
                    title="Editar"
                    onClick={() => handleEditar(punto)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    title="Inactivar"
                    onClick={() => handleInactivar(punto)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal crear */}
      {modalCrearAbierto && (
        <ModalCrearPunto
          onClose={() => setModalCrearAbierto(false)}
          onSave={obtenerPuntos}
        />
      )}

      {/* Modal editar */}
      {mostrarModalEditar && puntoEditar && (
        <ModalEditarPunto
          punto={puntoEditar}
          onClose={() => {
            setMostrarModalEditar(false)
            setPuntoEditar(null)
          }}
          onSave={obtenerPuntos}
        />
      )}

      {/* Modal inactivar */}
      {puntoInactivar && (
        <ModalPruebaInactivar
          punto={puntoInactivar}
          onClose={() => setPuntoInactivar(null)}
          onSave={obtenerPuntos}
        />
      )}
    </div>
  )
}
