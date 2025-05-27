// pages/api/transferencias/registrar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      punto_atencion_id: string
    }

    const { hacia_punto_id, moneda_id, monto, descripcion } = req.body

    if (!hacia_punto_id || !moneda_id || !monto || parseFloat(monto) <= 0) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }

    if (hacia_punto_id === decoded.punto_atencion_id) {
      return res.status(400).json({ error: 'No puedes transferir a tu propio punto' })
    }

    const montoDecimal = parseFloat(monto)

    // Validar saldo suficiente
    const saldoOrigen = await prisma.saldo.findUnique({
      where: {
        puntoAtencionId_monedaId: {
          puntoAtencionId: decoded.punto_atencion_id,
          monedaId: moneda_id,
        },
      },
    })

    if (!saldoOrigen || saldoOrigen.cantidad < montoDecimal) {
      return res.status(400).json({ error: 'Saldo insuficiente' })
    }

    await prisma.$transaction([
      // Registrar transferencia
      prisma.transferencia.create({
        data: {
          origenId: decoded.punto_atencion_id,
          destinoId: hacia_punto_id,
          monedaId: moneda_id,
          monto: montoDecimal,
          descripcion,
        },
      }),

      // Movimiento de salida en origen
      prisma.movimiento.create({
        data: {
          tipo: 'TRANSFERENCIA_SALIENTE',
          monto: montoDecimal,
          monedaId: moneda_id,
          usuarioId: decoded.userId,
          puntoAtencionId: decoded.punto_atencion_id,
          descripcion: `Transferencia a ${hacia_punto_id} - ${descripcion || ''}`,
        },
      }),

      // Movimiento de entrada en destino
      prisma.movimiento.create({
        data: {
          tipo: 'TRANSFERENCIA_ENTRANTE',
          monto: montoDecimal,
          monedaId: moneda_id,
          usuarioId: decoded.userId,
          puntoAtencionId: hacia_punto_id,
          descripcion: `Transferencia recibida de ${decoded.punto_atencion_id} - ${descripcion || ''}`,
        },
      }),

      // Restar del saldo origen
      prisma.saldo.update({
        where: {
          puntoAtencionId_monedaId: {
            puntoAtencionId: decoded.punto_atencion_id,
            monedaId: moneda_id,
          },
        },
        data: {
          cantidad: { decrement: montoDecimal },
        },
      }),

      // Sumar al saldo destino
      prisma.saldo.upsert({
        where: {
          puntoAtencionId_monedaId: {
            puntoAtencionId: hacia_punto_id,
            monedaId: moneda_id,
          },
        },
        update: {
          cantidad: { increment: montoDecimal },
        },
        create: {
          puntoAtencionId: hacia_punto_id,
          monedaId: moneda_id,
          cantidad: montoDecimal,
        },
      }),
    ])

    return res.status(200).json({ mensaje: 'Transferencia registrada correctamente' })
  } catch (err) {
    console.error('Error al registrar transferencia:', err)
    return res.status(500).json({ error: 'Error al procesar la transferencia' })
  }
}
