// pages/api/transferencias/historial.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { Decimal } from '@prisma/client/runtime/library'

type TransferenciaConRelaciones = {
  id: string
  monto: Decimal | number
  monedas?: { codigo: string | null } | null
  puntos_atencion_movimientos_hacia_puntoTopuntos_atencion?: { nombre: string | null } | null
  creado_en: Date | null
  observacion: string | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      punto_atencion_id: string
    }

    const transferencias = await prisma.movimientos.findMany({
      where: {
        tipo: 'TRANSFERENCIA',
        desde_punto: decoded.punto_atencion_id,
      },
      orderBy: { creado_en: 'desc' },
      include: {
        puntos_atencion_movimientos_hacia_puntoTopuntos_atencion: {
          select: { nombre: true },
        },
        monedas: {
          select: { codigo: true },
        },
      },
    })

    const resultado = transferencias.map((t: TransferenciaConRelaciones) => ({
      id: t.id,
      monto: parseFloat(t.monto.toString()),
      moneda: t.monedas?.codigo || '',
      destino: t.puntos_atencion_movimientos_hacia_puntoTopuntos_atencion?.nombre || '',
      fecha: t.creado_en ?? new Date(),
      observacion: t.observacion || '',
    }))

    return res.status(200).json(resultado)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al obtener historial' })
  }
}
