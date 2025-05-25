'use client'
import { useRouter } from 'next/router'

export default function LogoutButton() {
  const router = useRouter()

  const cerrarSesion = async () => {
    try {
      await fetch('/api/logout')
      router.push('/login')
    } catch {
      alert('Error al cerrar sesión')
    }
  }

  return (
    <button
      onClick={cerrarSesion}
      style={{ background: 'red', color: 'white', padding: '8px 16px', borderRadius: 4 }}
    >
      Cerrar sesión
    </button>
  )
}
