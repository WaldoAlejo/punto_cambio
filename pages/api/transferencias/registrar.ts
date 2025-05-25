// ✅ pages/api/transferencias/registrar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      punto_atencion_id: string
    }

    const { hacia_punto_id, moneda_id, monto, observacion } = req.body

    if (!hacia_punto_id || !moneda_id || !monto || parseFloat(monto) <= 0) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }

    if (hacia_punto_id === decoded.punto_atencion_id) {
      return res.status(400).json({ error: 'No puedes transferir a tu propio punto' })
    }

    const saldo = await prisma.saldos.findFirst({
      where: {
        punto_atencion_id: decoded.punto_atencion_id,
        moneda_id,
      },
    })

    if (!saldo || saldo.cantidad === null || parseFloat(saldo.cantidad.toString()) < parseFloat(monto)) {
      return res.status(400).json({ error: 'Saldo insuficiente' })
    }

    const montoDecimal = parseFloat(monto)

    await prisma.$transaction([
      prisma.movimientos.create({
        data: {
          tipo: 'TRANSFERENCIA',
          monto: montoDecimal,
          moneda_id,
          desde_punto: decoded.punto_atencion_id,
          hacia_punto: hacia_punto_id,
          generado_por: decoded.userId,
          observacion,
        },
      }),
      prisma.saldos.updateMany({
        where: {
          punto_atencion_id: decoded.punto_atencion_id,
          moneda_id,
        },
        data: {
          cantidad: { decrement: montoDecimal },
        },
      }),
      prisma.saldos.upsert({
        where: {
          punto_atencion_id_moneda_id: {
            punto_atencion_id: hacia_punto_id,
            moneda_id,
          },
        },
        update: {
          cantidad: { increment: montoDecimal },
        },
        create: {
          punto_atencion_id: hacia_punto_id,
          moneda_id,
          cantidad: montoDecimal,
        },
      }),
    ])

    return res.status(200).json({ mensaje: 'Transferencia realizada correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al procesar la transferencia' })
  }
}