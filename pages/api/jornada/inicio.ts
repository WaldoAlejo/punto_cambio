// pages/api/jornada/inicio.ts
import { NextApiRequest, NextApiResponse } from 'next'
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
      punto_atencion_id: string
    }

    const { id: userId, punto_atencion_id } = decoded

    // Evitar duplicados por día
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const existente = await prisma.jornada.findFirst({
      where: {
        usuarioId: userId,
        fechaInicio: { gte: hoy },
      },
    })

    if (existente) {
      return res.status(400).json({ error: 'Ya iniciaste jornada hoy' })
    }

    await prisma.jornada.create({
      data: {
        usuarioId: userId,
        puntoAtencionId: punto_atencion_id,
        fechaInicio: new Date(),
      },
    })

    return res.status(200).json({ mensaje: 'Jornada iniciada' })
  } catch (err) {
    console.error('Error en /api/jornada/inicio:', err)
    return res.status(500).json({ error: 'Error al iniciar jornada' })
  }
}
