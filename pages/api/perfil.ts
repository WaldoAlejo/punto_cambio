// pages/api/perfil.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const usuario = obtenerUsuarioDesdeRequest(req)

  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  return res.status(200).json({ mensaje: 'Acceso autorizado', usuario })
}
