// pages/api/cuadre/hoy.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const cuadre = await prisma.cuadres_caja.findFirst({
      where: {
        usuario_id: decoded.userId,
        fecha: { gte: hoy },
      },
    })

    if (!cuadre) return res.status(200).json(null)

    return res.status(200).json({
      entradas: cuadre.total_entradas,
      salidas: cuadre.total_salidas,
      saldo: cuadre.saldo_final,
      observaciones: cuadre.observaciones || '',
    })
  } catch {
    return res.status(500).json({ error: 'Error al consultar cuadre' })
  }
}
