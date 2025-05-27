// pages/index.tsx
import { GetServerSideProps } from 'next'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)

  if (!usuario) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  if (!usuario.punto_atencion_id) {
    return { redirect: { destination: '/seleccionar-punto', permanent: false } }
  }

  return { redirect: { destination: '/dashboard', permanent: false } }
}

export default function Home() {
  return null
}
