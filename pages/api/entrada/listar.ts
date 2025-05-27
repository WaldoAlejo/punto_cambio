// pages/api/entrada/listar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      punto_atencion_id: string
    }

    const entradas = await prisma.movimiento.findMany({
      where: {
        tipo: 'INGRESO',
        puntoAtencionId: decoded.punto_atencion_id,
      },
      orderBy: {
        fecha: 'desc',
      },
      include: {
        moneda: {
          select: { codigo: true },
        },
      },
    })

    const formateadas = entradas.map((e) => ({
      id: e.id,
      fecha: e.fecha,
      monto: e.monto,
      descripcion: e.descripcion,
      moneda: e.moneda,
    }))

    res.status(200).json(formateadas)
  } catch (error) {
    console.error('Error al listar entradas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
