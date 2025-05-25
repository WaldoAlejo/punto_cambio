// pages/index.tsx
import { GetServerSideProps } from 'next'
import { obtenerUsuarioDesdeContext } from '@/lib/auth'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const usuario = obtenerUsuarioDesdeContext(ctx)

  return {
    redirect: {
      destination: usuario ? '/dashboard' : '/login',
      permanent: false,
    },
  }
}

export default function Home() {
  return null
}
