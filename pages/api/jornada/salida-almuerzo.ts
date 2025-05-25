// pages/api/jornada/salida-almuerzo.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const cookies = req.headers.cookie
  const token = cookies ? parse(cookies).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const jornada = await prisma.jornadas.findFirst({
      where: {
        usuario_id: decoded.userId,
        fecha: { gte: hoy },
      },
    })

    if (!jornada) {
      return res.status(404).json({ error: 'No hay jornada activa para hoy' })
    }

    if (jornada.hora_salida_almuerzo) {
      return res.status(400).json({ error: 'Ya registraste la salida a almuerzo' })
    }

    await prisma.jornadas.update({
      where: { id: jornada.id },
      data: { hora_salida_almuerzo: new Date() },
    })

    return res.status(200).json({ mensaje: 'Salida a almuerzo registrada' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al registrar salida a almuerzo' })
  }
}
