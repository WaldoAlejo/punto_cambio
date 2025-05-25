import { useState, useEffect } from 'react'

type PuntoAtencion = {
  id: string
  nombre: string
}

export default function CrearUsuarioPage() {
  const [nombre, setNombre] = useState('')
  const [usuario, setUsuario] = useState('')
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [rol, setRol] = useState('EMPLEADO')
  const [puntoAtencion, setPuntoAtencion] = useState('')
  const [puntos, setPuntos] = useState<PuntoAtencion[]>([])
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargar puntos de atención disponibles
    fetch('/api/puntos-atencion')
      .then(res => res.json())
      .then(data => setPuntos(data || []))
      .catch(() => setPuntos([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre, usuario, correo, clave, rol, punto_atencion_id: puntoAtencion || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear usuario')
    } else {
      setMensaje('Usuario creado correctamente')
      setNombre('')
      setUsuario('')
      setCorreo('')
      setClave('')
      setPuntoAtencion('')
      setRol('EMPLEADO')
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>Crear nuevo usuario</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Usuario:</label>
        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} required />

        <label>Correo:</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

        <label>Contraseña:</label>
        <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} required />

        <label>Rol:</label>
        <select value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="EMPLEADO">EMPLEADO</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <label>Punto de atención (opcional):</label>
        <select value={puntoAtencion} onChange={(e) => setPuntoAtencion(e.target.value)}>
          <option value="">-- Ninguno --</option>
          {puntos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <button type="submit">Crear Usuario</button>
        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
