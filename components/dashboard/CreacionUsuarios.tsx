'use client'

import { useEffect, useState } from 'react'
import ModalEditarUsuario from './modals/ModalEditarUsuario'
import ModalResetearClave from './modals/ModalResetearClave'
import { Usuario } from '@/shared/types'
import { Pencil, Trash2, KeyRound } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function CreacionUsuarios() {
  const [nombre, setNombre] = useState('')
  const [usuario, setUsuario] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [rol, setRol] = useState<'ADMIN' | 'OPERADOR'>('OPERADOR')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')

  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [usuarioReset, setUsuarioReset] = useState<Usuario | null>(null)
  const [mostrarModalReset, setMostrarModalReset] = useState(false)

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch('/api/admin/listar-usuarios')
      const data = await res.json()
      setUsuarios(data)
    } catch (err) {
      console.error('Error al obtener usuarios:', err)
    }
  }

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, usuario, correo: correo || null, clave, rol }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear usuario')
    } else {
      setMensaje('✅ Usuario creado correctamente')
      setNombre('')
      setUsuario('')
      setCorreo('')
      setClave('')
      setRol('OPERADOR')
      obtenerUsuarios()
    }
  }

  const handleDesactivar = async (id: string) => {
    const confirmar = confirm('¿Deseas desactivar este usuario?')
    if (!confirmar) return

    try {
      const res = await fetch(`/api/admin/desactivar-usuario`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (res.ok) obtenerUsuarios()
    } catch (err) {
      console.error('Error al desactivar usuario:', err)
    }
  }

  const usuariosFiltrados = usuarios.filter((u) =>
    u.username.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-10">
        <h2 className="text-3xl font-bold text-yellow-600 text-center">Administrar usuarios</h2>

        {/* Formulario de creación */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow border space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input" />
            <input placeholder="Nombre de usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required className="input" />
            <input placeholder="Correo (opcional)" value={correo} onChange={(e) => setCorreo(e.target.value)} className="input" />
            <input placeholder="Contraseña" value={clave} onChange={(e) => setClave(e.target.value)} required className="input" type="password" />
            <select value={rol} onChange={(e) => setRol(e.target.value as 'ADMIN' | 'OPERADOR')} className="input col-span-1 md:col-span-2">
              <option value="OPERADOR">OPERADOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-6 py-2 rounded font-semibold">
              Crear Usuario
            </button>
          </div>
          {mensaje && <p className="text-green-600 font-medium">{mensaje}</p>}
          {error && <p className="text-red-600 font-medium">{error}</p>}
        </form>

        {/* Tabla de usuarios */}
        <div className="bg-white p-6 rounded-lg shadow border space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h3 className="text-xl font-semibold mb-2 md:mb-0">Usuarios registrados</h3>
            <input
              type="text"
              placeholder="Buscar por nombre de usuario..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input w-full md:w-80"
            />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-left border text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border">Usuario</th>
                  <th className="p-3 border">Nombre</th>
                  <th className="p-3 border">Rol</th>
                  <th className="p-3 border text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 border">{u.username}</td>
                    <td className="p-3 border">{u.nombre}</td>
                    <td className="p-3 border">{u.rol}</td>
                    <td className="p-3 border">
                      <div className="flex justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => { setUsuarioEditar(u); setMostrarModalEditar(true) }}>
                              <Pencil className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => handleDesactivar(u.id)}>
                              <Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Desactivar</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button onClick={() => { setUsuarioReset(u); setMostrarModalReset(true) }}>
                              <KeyRound className="w-5 h-5 text-gray-700 hover:text-gray-900" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Resetear clave</TooltipContent>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modales */}
        {usuarioEditar && mostrarModalEditar && (
          <ModalEditarUsuario usuario={usuarioEditar} onClose={() => setMostrarModalEditar(false)} onSave={obtenerUsuarios} />
        )}
        {usuarioReset && mostrarModalReset && (
          <ModalResetearClave usuario={usuarioReset} onClose={() => setMostrarModalReset(false)} onSave={obtenerUsuarios} />
        )}

        {/* Estilos */}
        <style jsx>{`
          .input {
            border: 1px solid #ccc;
            padding: 0.5rem;
            border-radius: 0.375rem;
            transition: border 0.2s;
          }
          .input:focus {
            outline: none;
            border-color: #facc15;
          }
        `}</style>
      </div>
    </TooltipProvider>
  )
}
