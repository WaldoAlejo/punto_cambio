import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role: string
    }

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado' })
    }

    const transferencias = await prisma.movimiento.findMany({
      where: {
        tipo: {
          in: ['TRANSFERENCIA_ENTRANTE', 'TRANSFERENCIA_SALIENTE'],
        },
      },
      orderBy: { fecha: 'desc' },
      include: {
        moneda: { select: { codigo: true } },
        puntoAtencion: { select: { nombre: true } },
        usuario: { select: { nombre: true } },
      },
    })

    const resultado = transferencias.map((t) => ({
      id: t.id,
      monto: parseFloat(t.monto.toString()),
      moneda: t.moneda?.codigo || '',
      punto: t.puntoAtencion?.nombre || '',
      generado_por: t.usuario?.nombre || '',
      tipo: t.tipo,
      fecha: t.fecha,
      observacion: t.descripcion || '',
    }))

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Error en /admin/transferencias/historial:', error)
    return res.status(500).json({ error: 'Error al obtener historial global' })
  }
}
