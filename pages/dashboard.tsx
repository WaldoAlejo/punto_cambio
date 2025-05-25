// pages/dashboard.tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

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
