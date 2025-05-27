import jwt from 'jsonwebtoken'
import type { RolUsuario } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'clave-super-secreta'

export interface JWTPayload {
  id: string
  rol: RolUsuario
  punto_atencion_id?: string | null
}

export function generarToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

export function verificarToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}
