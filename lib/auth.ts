// lib/auth.ts
import { parse } from 'cookie'
import { verificarToken, JWTPayload } from '@/utils/jwt'
import { NextApiRequest } from 'next'
import { GetServerSidePropsContext } from 'next'

export function obtenerUsuarioDesdeRequest(req: NextApiRequest): JWTPayload | null {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const token = cookies.token

  if (!token) return null

  try {
    return verificarToken(token)
  } catch {
    return null
  }
}

export function obtenerUsuarioDesdeContext(ctx: GetServerSidePropsContext): JWTPayload | null {
  const token = ctx.req.headers.cookie ? parse(ctx.req.headers.cookie).token : null

  if (!token) return null

  try {
    return verificarToken(token)
  } catch {
    return null
  }
}
