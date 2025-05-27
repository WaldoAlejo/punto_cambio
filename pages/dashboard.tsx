'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

const menuOpciones = {
  ADMIN: [
    {
      categoria: 'Punto Cambio',
      opciones: [
        { nombre: 'Usuarios', ruta: '/usuarios' },
        { nombre: 'Puntos de Atención', ruta: '/puntos-atencion' },
        { nombre: 'Asignar Saldo', ruta: '/asignar-saldo' },
        { nombre: 'Informe de Saldos', ruta: '/informe-saldos' },
        { nombre: 'Transferencias', ruta: '/admin/transferencias' },
        { nombre: 'Jornada', ruta: '/admin/jornada' },
        { nombre: 'Cierres', ruta: '/admin/cierres' },
      ],
    },
    {
      categoria: 'Servientrega',
      opciones: [], // Por implementar
    },
  ],
  OPERADOR: [
    {
      categoria: 'Punto Cambio',
      opciones: [
        { nombre: 'Divisas', ruta: '/nuevo-cambio' },
        { nombre: 'Transferencias y Retiros', ruta: '/salidas' },
        { nombre: 'Ingreso de Saldo', ruta: '/entradas' },
        { nombre: 'Cierre de Caja', ruta: '/cuadre' },
        { nombre: 'Jornada', ruta: '/jornada' },
        { nombre: 'Cerrar Sesión', ruta: '/logout' },
      ],
    },
    {
      categoria: 'Servientrega',
      opciones: [], // Por implementar
    },
  ],
}

export default function DashboardLayout() {
  const [rol, setRol] = useState<'ADMIN' | 'OPERADOR' | null>(null)
  const [cargando, setCargando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener el rol desde la API del perfil
    const fetchRol = async () => {
      const res = await fetch('/api/perfil')
      const data = await res.json()
      if (!res.ok || !data.usuario) {
        router.push('/login')
        return
      }
      setRol(data.usuario.rol)
      setCargando(false)
    }
    fetchRol()
  }, [router])

  if (cargando) return <p style={{ padding: 20 }}>Cargando menú...</p>

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 250, background: '#f0f0f0', padding: 20 }}>
        <h2 style={{ marginBottom: 24 }}>Menú</h2>
        {rol && menuOpciones[rol].map((bloque) => (
          <div key={bloque.categoria} style={{ marginBottom: 24 }}>
            <h4>{bloque.categoria}</h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {bloque.opciones.map((op) => (
                <li key={op.ruta} style={{ marginTop: 8 }}>
                  <Link href={op.ruta}>{op.nombre}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      <main style={{ flexGrow: 1, padding: 40 }}>
        <h1>Bienvenido al Panel</h1>
        <p>Selecciona una opción del menú para comenzar.</p>
      </main>
    </div>
  )
}
