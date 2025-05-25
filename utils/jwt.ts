// utils/jwt.ts
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'clave-super-secreta'

export interface JWTPayload {
  userId: string
  role: 'ADMIN' | 'EMPLEADO'
  punto_atencion_id?: string | null
}

export function generarToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

export function verificarToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}
