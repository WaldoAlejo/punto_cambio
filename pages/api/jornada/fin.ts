// pages/api/jornada/fin.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

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

    if (jornada.fechaSalida) {
      return res.status(400).json({ error: 'Ya registraste el fin de jornada' })
    }

    // 1. Registrar hora de salida
    await prisma.jornada.update({
      where: { id: jornada.id },
      data: { fechaSalida: new Date() },
    })

    // 2. Liberar el punto de atención
    await prisma.usuario.update({
      where: { id: decoded.id },
      data: { punto_atencion_id: null },
    })

    return res.status(200).json({ mensaje: 'Fin de jornada registrado y punto liberado' })
  } catch (err) {
    console.error('Error en /api/jornada/fin:', err)
    return res.status(500).json({ error: 'Error al registrar fin de jornada' })
  }
}
