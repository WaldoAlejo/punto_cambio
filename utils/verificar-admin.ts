// utils/verificar-admin.ts
import { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

export function verificarAdmin(req: NextApiRequest) {
  const cookies = req.headers.cookie
  if (!cookies) return null

  const parsed = parse(cookies)
  const token = parsed.token
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      role: string
      punto_atencion_id: string | null
    }

    if (decoded.role !== 'ADMIN') return null
    return decoded
  } catch {
    return null
  }
}
