'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [mostrarClave, setMostrarClave] = useState(false)
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
        body: JSON.stringify({ usuario, clave }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error desconocido')
        return
      }

      const { user } = data
      if (!user?.punto_atencion_id) {
        router.push('/seleccionar-punto')
      } else {
        router.push('/dashboard')
      }
    } catch {
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
          Usuario:
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Contraseña:
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={mostrarClave ? 'text' : 'password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setMostrarClave(!mostrarClave)}
              style={{
                marginLeft: 8,
                padding: '2px 6px',
                fontSize: 12,
              }}
            >
              {mostrarClave ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </label>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
      </form>
    </div>
  )
}
