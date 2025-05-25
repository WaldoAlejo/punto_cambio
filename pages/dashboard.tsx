import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { useEstadoJornada } from '@/hooks/useEstadoJornada'

type Saldo = {
  moneda: string
  cantidad: number
}

type Props = {
  usuario: {
    userId: string
    role: 'ADMIN' | 'EMPLEADO'
    punto_atencion_id: string
  }
  saldos: Saldo[]
}

export default function DashboardPage({ usuario, saldos }: Props) {
  const { estado, registrar, mensaje, error, loading } = useEstadoJornada()

  const siguienteAccion = () => {
    if (!estado.inicio) return 'inicio'
    if (!estado.salida_almuerzo) return 'salida-almuerzo'
    if (!estado.regreso_almuerzo) return 'regreso-almuerzo'
    if (!estado.fin) return 'fin'
    return null
  }

  const accion = siguienteAccion()

  return (
    <div style={{ padding: 40 }}>
      <LogoutButton />
      <h1>Dashboard</h1>
      <p>ID: <strong>{usuario.userId}</strong></p>
      <p>Rol: <strong>{usuario.role}</strong></p>

      <h2 style={{ marginTop: 40 }}>💰 Saldos disponibles</h2>
      {saldos.length === 0 ? (
        <p>No hay saldos registrados</p>
      ) : (
        <ul>
          {saldos.map((s: Saldo) => (
            <li key={s.moneda}>
              {s.moneda}: <strong>{s.cantidad.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 50 }}>
        <Link href="/nuevo-cambio">
          <button style={{ padding: '10px 20px', fontSize: '16px' }}>
            ➕ Nuevo cambio de divisas
          </button>
        </Link>
      </div>

      {/* Sección de control de jornada */}
      <div style={{ marginTop: 60 }}>
        <h2>🕒 Control de Jornada</h2>
        <p><strong>Inicio:</strong> {estado.inicio || '—'}</p>
        <p><strong>Salida almuerzo:</strong> {estado.salida_almuerzo || '—'}</p>
        <p><strong>Regreso almuerzo:</strong> {estado.regreso_almuerzo || '—'}</p>
        <p><strong>Fin jornada:</strong> {estado.fin || '—'}</p>

        {accion ? (
          <button onClick={() => registrar(accion)} disabled={loading} style={{ marginTop: 16 }}>
            Registrar {accion.replace('-', ' ')}
          </button>
        ) : (
          <p style={{ marginTop: 16 }}>✅ Jornada completada</p>
        )}

        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  )
}
