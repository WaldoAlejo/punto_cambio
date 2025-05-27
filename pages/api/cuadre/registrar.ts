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

    const {
      total_entradas,
      total_salidas,
      saldo_final,
      observaciones,
      razonParcial, // Nuevo campo
    } = req.body

    if (
      total_entradas == null ||
      total_salidas == null ||
      saldo_final == null
    ) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const yaCuadrado = await prisma.cuadreCaja.findFirst({
      where: {
        usuarioId: decoded.userId,
        fecha: { gte: hoy },
      },
    })

    if (yaCuadrado) {
      return res.status(400).json({ error: 'Ya realizaste el cuadre de caja hoy' })
    }

    await prisma.cuadreCaja.create({
      data: {
        usuarioId: decoded.userId,
        puntoAtencionId: decoded.punto_atencion_id,
        fecha: new Date(),
        entradas: total_entradas,
        salidas: total_salidas,
        saldo: saldo_final,
        observaciones,
        razonParcial: razonParcial || null,
      },
    })

    await prisma.usuario.update({
      where: { id: decoded.userId },
      data: { punto_atencion_id: null },
    })

    return res.status(200).json({ mensaje: 'Cuadre y liberación realizados con razón registrada' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
