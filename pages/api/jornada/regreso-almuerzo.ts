// pages/api/jornada/regreso-almuerzo.ts
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
      id: string
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const jornada = await prisma.jornada.findFirst({
      where: {
        usuarioId: decoded.id,
        fechaInicio: { gte: hoy },
      },
    })

    if (!jornada) {
      return res.status(404).json({ error: 'No hay jornada activa para hoy' })
    }

    if (jornada.fechaRegreso) {
      return res.status(400).json({ error: 'Ya registraste el regreso de almuerzo' })
    }

    if (!jornada.fechaAlmuerzo) {
      return res.status(400).json({ error: 'Primero debes registrar la salida a almuerzo' })
    }

    await prisma.jornada.update({
      where: { id: jornada.id },
      data: { fechaRegreso: new Date() },
    })

    return res.status(200).json({ mensaje: 'Regreso de almuerzo registrado' })
  } catch (err) {
    console.error('Error en /api/jornada/regreso-almuerzo:', err)
    return res.status(500).json({ error: 'Error al registrar regreso de almuerzo' })
  }
}
