'use client'

import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface Punto {
  id: string
  nombre: string
}

interface Props {
  puntos: Punto[]
}

export default function SeleccionarPuntoPage({ puntos }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [seleccionado, setSeleccionado] = useState<string | null>(null)

  const seleccionar = async (id: string) => {
    setLoading(true)
    setError('')
    setSeleccionado(id)
    try {
      const res = await fetch('/api/usuario/asignar-punto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ punto_atencion_id: id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al asignar punto')

      router.push('/dashboard')
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Selecciona tu Punto de Atención</h1>
      {error && <p style={{ color: 'red', marginBottom: 20 }}>{error}</p>}
      {puntos.length === 0 ? (
        <p>No hay puntos disponibles actualmente.</p>
      ) : (
        puntos.map((p) => (
          <button
            key={p.id}
            onClick={() => seleccionar(p.id)}
            aria-label={`Seleccionar punto ${p.nombre}`}
            style={{
              display: 'block',
              margin: '12px 0',
              padding: '10px 15px',
              fontWeight: seleccionado === p.id ? 'bold' : 'normal',
              backgroundColor: seleccionado === p.id ? '#e0e0e0' : 'white',
              border: '1px solid #ccc',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {p.nombre}
          </button>
        ))
      )}
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

  const puntosOcupados = await prisma.usuario.findMany({
    where: { punto_atencion_id: { not: null } },
    select: { punto_atencion_id: true },
  })

  const puntos = await prisma.puntoAtencion.findMany({
    where: {
      id: {
        notIn: puntosOcupados
          .map((p) => p.punto_atencion_id!)
          .filter(Boolean),
      },
    },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  })

  return {
    props: { puntos },
  }
}
