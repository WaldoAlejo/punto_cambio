// pages/seleccionar-punto.tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { useRouter } from 'next/router'
import { useState } from 'react'

type Props = {
  puntos: {
    id: string
    nombre: string
  }[]
}

export default function SeleccionarPuntoPage({ puntos }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const seleccionar = async (id: string) => {
    setLoading(true)
    await fetch('/api/asignar-punto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ punto_atencion_id: id }),
    })
    router.push('/dashboard')
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Selecciona tu Punto de Atención</h1>
      {puntos.map((p) => (
        <button
          key={p.id}
          onClick={() => seleccionar(p.id)}
          style={{ display: 'block', margin: '12px 0' }}
          disabled={loading}
        >
          {p.nombre}
        </button>
      ))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)

  if (!usuario) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  if (usuario.punto_atencion_id) {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }

  const puntos = await prisma.puntos_atencion.findMany({
    select: { id: true, nombre: true },
  })

  return {
    props: { puntos },
  }
}
