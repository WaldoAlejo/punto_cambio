'use client'

import { useEffect, useState } from 'react'
import ModalEditarUsuario from './modals/ModalEditarUsuario'
import ModalResetearClave from './modals/ModalResetearClave'
import { Usuario } from '@/shared/types'

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
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h2 className="text-3xl font-bold text-yellow-600">Administrar usuarios</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 shadow-md rounded-lg border border-gray-200">
        <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input" />
        <input placeholder="Nombre de usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required className="input" />
        <input placeholder="Correo (opcional)" value={correo} onChange={(e) => setCorreo(e.target.value)} className="input" />
        <input placeholder="Contraseña" value={clave} onChange={(e) => setClave(e.target.value)} required className="input" type="password" />
        <select value={rol} onChange={(e) => setRol(e.target.value as 'ADMIN' | 'OPERADOR')} className="input">
          <option value="OPERADOR">OPERADOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-4 py-2 rounded-md font-semibold col-span-1 md:col-span-2">
          Crear Usuario
        </button>
        {mensaje && <p className="text-green-600 font-medium col-span-2">{mensaje}</p>}
        {error && <p className="text-red-600 font-medium col-span-2">{error}</p>}
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h3 className="text-xl font-semibold">Usuarios registrados</h3>
          <input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input w-full md:w-80"
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Usuario</th>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Rol</th>
                <th className="p-2 border text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="p-2 border">{u.username}</td>
                  <td className="p-2 border">{u.nombre}</td>
                  <td className="p-2 border">{u.rol}</td>
                  <td className="p-2 border text-center space-x-2">
                    <button onClick={() => { setUsuarioEditar(u); setMostrarModalEditar(true) }} className="btn btn-blue">Editar</button>
                    <button onClick={() => handleDesactivar(u.id)} className="btn btn-red">Desactivar</button>
                    <button onClick={() => { setUsuarioReset(u); setMostrarModalReset(true) }} className="btn btn-gray">Resetear clave</button>
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

      {usuarioEditar && mostrarModalEditar && (
        <ModalEditarUsuario usuario={usuarioEditar} onClose={() => setMostrarModalEditar(false)} onSave={obtenerUsuarios} />
      )}
      {usuarioReset && mostrarModalReset && (
        <ModalResetearClave usuario={usuarioReset} onClose={() => setMostrarModalReset(false)} onSave={obtenerUsuarios} />
      )}

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
        .btn {
          padding: 0.4rem 0.75rem;
          border-radius: 0.375rem;
          font-weight: 500;
          color: white;
          transition: background 0.2s;
        }
        .btn-blue {
          background-color: #3b82f6;
        }
        .btn-blue:hover {
          background-color: #2563eb;
        }
        .btn-red {
          background-color: #ef4444;
        }
        .btn-red:hover {
          background-color: #dc2626;
        }
        .btn-gray {
          background-color: #6b7280;
        }
        .btn-gray:hover {
          background-color: #4b5563;
        }
      `}</style>
    </div>
  )
}
