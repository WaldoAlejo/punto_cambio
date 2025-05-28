// pages/dashboard.tsx
import { GetServerSideProps } from 'next'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { useState } from 'react'
import { useRouter } from 'next/router'

interface Props {
  usuario: {
    id: string
    rol: 'ADMIN' | 'OPERADOR'
    punto_atencion_id: string | null
  }
}

export default function DashboardPage({ usuario }: Props) {
  const [seccion, setSeccion] = useState('')
  const router = useRouter()

  const menuAdmin = [
    { label: 'Usuarios', value: 'usuarios' },
    { label: 'Puntos de Atención', value: 'puntos-atencion' },
    { label: 'Asignar Saldo', value: 'asignar-saldo' },
    { label: 'Informe de Saldos', value: 'informe-saldos' },
    { label: 'Transferencias', value: 'transferencias' },
    { label: 'Jornada', value: 'jornada' },
    { label: 'Cierres', value: 'cierres' },
  ]

  const menuEmpleado = [
    { label: 'Divisas', value: 'divisas' },
    { label: 'Transferencias y Retiros', value: 'retiros' },
    { label: 'Ingreso de Saldo', value: 'ingresos' },
    { label: 'Cierre de Caja', value: 'cierre-caja' },
    { label: 'Jornada', value: 'jornada' },
    { label: 'Cerrar Sesión', value: 'logout' },
  ]

  const handleSeleccion = async (value: string) => {
    if (value === 'logout') {
      await fetch('/api/logout')
      router.push('/login')
      return
    }
    setSeccion(value)
  }

  const renderContenido = () => {
    if (!seccion) return <p>Selecciona una opción del menú</p>
    return <p>Has seleccionado: <strong>{seccion}</strong></p>
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 250, backgroundColor: '#f4f4f4', padding: 20 }}>
        <h2>Punto Cambio</h2>
        <ul>
          {(usuario.rol === 'ADMIN' ? menuAdmin : menuEmpleado).map(item => (
            <li key={item.value}>
              <button
                onClick={() => handleSeleccion(item.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <hr />
        <h2>Servientrega</h2>
        <p>(Próximamente)</p>
      </aside>
      <main style={{ flex: 1, padding: 30 }}>{renderContenido()}</main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)

  if (!usuario) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: { usuario },
  }
}
