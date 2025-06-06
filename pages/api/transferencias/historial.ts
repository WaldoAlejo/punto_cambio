// pages/api/transferencias/historial.ts
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
      punto_atencion_id: string
    }

    const transferencias = await prisma.transferencia.findMany({
      where: {
        origenId: decoded.punto_atencion_id,
      },
      orderBy: { fecha: 'desc' },
      include: {
        destino: {
          select: { nombre: true },
        },
        moneda: {
          select: { codigo: true },
        },
      },
    })

    const resultado = transferencias.map((t) => ({
      id: t.id,
      monto: t.monto,
      moneda: t.moneda.codigo,
      destino: t.destino.nombre,
      fecha: t.fecha,
      descripcion: t.descripcion || '',
    }))

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Error al obtener historial de transferencias:', error)
    return res.status(500).json({ error: 'Error al obtener historial' })
  }
}
