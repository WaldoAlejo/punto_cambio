// pages/api/salida/registrar.ts
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
      id: string
      punto_atencion_id: string
    }

    const { monto, monedaId, descripcion } = req.body

    if (!monto || !monedaId) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    await prisma.movimiento.create({
      data: {
        tipo: 'EGRESO',
        monto,
        monedaId,
        usuarioId: decoded.id,
        puntoAtencionId: decoded.punto_atencion_id,
        descripcion: descripcion || '',
      },
    })

    res.status(200).json({ mensaje: 'Salida registrada correctamente' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar salida' })
  }
}
