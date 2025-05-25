// pages/login.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo, clave }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error desconocido')
      } else {
        // redirigir al home o dashboard
       const perfil = await fetch('/api/perfil')
const dataPerfil = await perfil.json()

if (!dataPerfil.usuario?.punto_atencion_id) {
  router.push('/seleccionar-punto')
} else {
  router.push('/dashboard')
}
      }
    } catch (err) {
      setError('Error de red o del servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h1>Iniciar Sesión</h1>
      <form onSubmit={handleLogin}>
        <label>
          Correo:
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Contraseña:
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
