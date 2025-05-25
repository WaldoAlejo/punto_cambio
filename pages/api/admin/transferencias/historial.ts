// pages/api/admin/transferencias/historial.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { Decimal } from '@prisma/client/runtime/library'

type TransferenciaGlobal = {
  id: string
  monto: Decimal | number
  creado_en: Date | null
  observacion: string | null
  monedas?: { codigo: string | null } | null
  puntos_atencion_movimientos_desde_puntoTopuntos_atencion?: { nombre: string | null } | null
  puntos_atencion_movimientos_hacia_puntoTopuntos_atencion?: { nombre: string | null } | null
  usuarios_movimientos_generado_porTousuarios?: { nombre: string | null } | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role: string
    }

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const transferencias = await prisma.movimientos.findMany({
      where: { tipo: 'TRANSFERENCIA' },
      orderBy: { creado_en: 'desc' },
      include: {
        monedas: { select: { codigo: true } },
        puntos_atencion_movimientos_desde_puntoTopuntos_atencion: { select: { nombre: true } },
        puntos_atencion_movimientos_hacia_puntoTopuntos_atencion: { select: { nombre: true } },
        usuarios_movimientos_generado_porTousuarios: { select: { nombre: true } },
      },
    })

    const resultado = transferencias.map((t: TransferenciaGlobal) => ({
      id: t.id,
      monto: parseFloat(t.monto.toString()),
      moneda: t.monedas?.codigo || '',
      origen: t.puntos_atencion_movimientos_desde_puntoTopuntos_atencion?.nombre || '',
      destino: t.puntos_atencion_movimientos_hacia_puntoTopuntos_atencion?.nombre || '',
      generado_por: t.usuarios_movimientos_generado_porTousuarios?.nombre || '',
      fecha: t.creado_en ?? new Date(),
      observacion: t.observacion || '',
    }))

    return res.status(200).json(resultado)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al obtener historial global' })
  }
}
