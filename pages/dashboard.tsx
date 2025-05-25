import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { useEstadoJornada } from '@/hooks/useEstadoJornada'
import { useCuadreCajaHoy } from '@/hooks/useCuadreCajaHoy'

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
  const { cuadre, loading: cargandoCuadre } = useCuadreCajaHoy()

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
          <button
            onClick={() => registrar(accion)}
            disabled={loading || (accion === 'fin' && !cuadre)}
            style={{ marginTop: 16 }}
          >
            Registrar {accion.replace('-', ' ')}
          </button>
        ) : (
          <p style={{ marginTop: 16 }}>✅ Jornada completada</p>
        )}

        {accion === 'fin' && !cuadre && (
          <p style={{ color: 'red', marginTop: 8 }}>
            ⚠️ Debes realizar el cuadre de caja antes de finalizar la jornada.
          </p>
        )}

        {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {/* Sección de cuadre de caja */}
      <div style={{ marginTop: 50 }}>
        <h2>📊 Cuadre de Caja Diario</h2>
        {cargandoCuadre ? (
          <p>Cargando cuadre...</p>
        ) : cuadre ? (
          <div>
            <p><strong>Entradas:</strong> {cuadre.entradas.toFixed(2)}</p>
            <p><strong>Salidas:</strong> {cuadre.salidas.toFixed(2)}</p>
            <p><strong>Saldo final:</strong> {cuadre.saldo.toFixed(2)}</p>
            {cuadre.observaciones && <p><strong>Obs:</strong> {cuadre.observaciones}</p>}
            <p style={{ color: 'green', marginTop: 8 }}>✅ Cuadre de caja registrado</p>
          </div>
        ) : (
          <p style={{ color: 'red' }}>⚠️ Aún no has realizado el cuadre de caja hoy</p>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)

  if (!usuario || !usuario.punto_atencion_id) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const saldosDb = await prisma.saldos.findMany({
    where: {
      punto_atencion_id: usuario.punto_atencion_id,
      cantidad: { gt: 0 },
    },
    include: {
      monedas: true,
    },
  })

  type SaldosWithMoneda = typeof saldosDb[number]

  const saldos: Saldo[] = saldosDb.map((s: SaldosWithMoneda) => ({
    moneda: s.monedas?.codigo || '---',
    cantidad: parseFloat(s.cantidad?.toString() || '0'),
  }))

  return {
    props: {
      usuario,
      saldos,
    },
  }
}
