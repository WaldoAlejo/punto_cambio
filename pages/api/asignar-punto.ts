// pages/api/asignar-punto.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'
import { generarToken } from '@/utils/jwt'
import { serialize } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const usuario = obtenerUsuarioDesdeRequest(req)
  if (!usuario) return res.status(401).end()

  const { punto_atencion_id } = req.body

  await prisma.usuarios.update({
    where: { id: usuario.userId },
    data: { punto_atencion_id },
  })

  const updatedToken = generarToken({
    ...usuario,
    punto_atencion_id,
  })

  res.setHeader(
    'Set-Cookie',
    serialize('token', updatedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
  )

  res.status(200).json({ mensaje: 'Punto asignado correctamente' })
}
