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
      id: string
    }

    const userId = decoded.id

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // 1. Obtener último cuadre anterior al día de hoy
    const cuadreAnterior = await prisma.cuadreCaja.findFirst({
      where: {
        usuarioId: userId,
        fecha: { lt: hoy },
      },
      orderBy: { fecha: 'desc' },
    })

    const saldo_anterior = cuadreAnterior?.saldo ?? 0

    // 2. Obtener sumatoria de entradas y salidas de hoy
    const movimientos = await prisma.movimiento.findMany({
      where: {
        usuarioId: userId,
        fecha: { gte: hoy },
      },
    })

    const entradas = movimientos
      .filter((m) => m.tipo === 'INGRESO' || m.tipo === 'TRANSFERENCIA_ENTRANTE')
      .reduce((acc, m) => acc + m.monto, 0)

    const salidas = movimientos
      .filter((m) => m.tipo === 'EGRESO' || m.tipo === 'TRANSFERENCIA_SALIENTE')
      .reduce((acc, m) => acc + m.monto, 0)

    const cuadre = await prisma.cuadreCaja.findFirst({
      where: {
        usuarioId: userId,
        fecha: { gte: hoy },
      },
    })

    return res.status(200).json({
      saldo_anterior,
      entradas,
      salidas,
      saldo: saldo_anterior + entradas - salidas,
      observaciones: cuadre?.observaciones ?? '',
      razonParcial: cuadre?.razonParcial ?? null,
    })
  } catch (err) {
    console.error('Error en /api/cuadre/hoy:', err)
    return res.status(500).json({ error: 'Error al consultar cuadre' })
  }
}
