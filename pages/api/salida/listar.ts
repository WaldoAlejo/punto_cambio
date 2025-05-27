// pages/api/salida/listar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      punto_atencion_id: string
    }

    const salidas = await prisma.movimiento.findMany({
      where: {
        tipo: 'EGRESO',
        usuarioId: decoded.id,
        puntoAtencionId: decoded.punto_atencion_id,
      },
      orderBy: {
        fecha: 'desc',
      },
      include: {
        moneda: true,
      },
    })

    const data = salidas.map((s) => ({
      id: s.id,
      fecha: s.fecha.toISOString(),
      moneda: s.moneda?.codigo || '---',
      monto: s.monto,
      descripcion: s.descripcion || '',
    }))

    return res.status(200).json(data)
  } catch (err) {
    console.error('Error en /api/salida/listar:', err)
    return res.status(500).json({ error: 'Error al obtener salidas' })
  }
}
