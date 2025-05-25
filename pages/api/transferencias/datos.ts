// pages/api/transferencias/datos.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      punto_atencion_id: string
    }

    const puntos = await prisma.puntos_atencion.findMany({
      where: {
        id: { not: decoded.punto_atencion_id },
      },
      select: {
        id: true,
        nombre: true,
      },
    })

    const monedas = await prisma.monedas.findMany({
      select: {
        id: true,
        codigo: true,
      },
    })

    return res.status(200).json({ puntos, monedas })
  } catch {
    return res.status(500).json({ error: 'Error al obtener datos' })
  }
}
