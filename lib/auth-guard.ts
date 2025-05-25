// lib/auth-guard.ts
import { GetServerSidePropsContext } from 'next'
import { parse } from 'cookie'
import { verificarToken } from '@/utils/jwt'

export function protegerRuta(ctx: GetServerSidePropsContext) {
  const cookies = ctx.req.headers.cookie
  const token = cookies ? parse(cookies).token : null

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  try {
    const usuario = verificarToken(token)
    return {
      props: {
        usuario,
      },
    }
  } catch {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
}
