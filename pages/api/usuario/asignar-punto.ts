// pages/api/usuario/asignar-punto.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const cookies = req.headers.cookie
  if (!cookies) return res.status(401).json({ error: 'No autenticado' })

  const { token } = parse(cookies)
  if (!token) return res.status(401).json({ error: 'Token no encontrado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
    }

    const { punto_atencion_id } = req.body
    if (!punto_atencion_id) {
      return res.status(400).json({ error: 'Falta el punto de atención' })
    }

    // Verificar si el punto ya está asignado a otro usuario
    const yaAsignado = await prisma.usuario.findFirst({
      where: { punto_atencion_id },
    })

    if (yaAsignado) {
      return res.status(409).json({ error: 'Punto de atención ya está en uso' })
    }

    await prisma.usuario.update({
      where: { id: decoded.id },
      data: { punto_atencion_id },
    })

    return res.status(200).json({ mensaje: 'Punto asignado correctamente' })
  } catch (err) {
    console.error('Error al asignar punto:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
