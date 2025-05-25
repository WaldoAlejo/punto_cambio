// pages/api/cuadre/registrar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      punto_atencion_id: string
    }

    const { total_entradas, total_salidas, saldo_final, observaciones } = req.body

    if (
      total_entradas == null ||
      total_salidas == null ||
      saldo_final == null
    ) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const yaCuadrado = await prisma.cuadres_caja.findFirst({
      where: {
        usuario_id: decoded.userId,
        fecha: { gte: hoy },
      },
    })

    if (yaCuadrado) {
      return res.status(400).json({ error: 'Ya realizaste el cuadre de caja hoy' })
    }

    await prisma.cuadres_caja.create({
      data: {
        usuario_id: decoded.userId,
        punto_atencion_id: decoded.punto_atencion_id,
        fecha: hoy,
        total_entradas,
        total_salidas,
        saldo_final,
        observaciones,
      },
    })

    return res.status(200).json({ mensaje: 'Cuadre de caja registrado correctamente' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
