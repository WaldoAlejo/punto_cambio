// pages/api/movimiento/registrar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      punto_atencion_id: string
    }

    const { tipo, monto, monedaId, descripcion } = req.body

    if (!tipo || !monto || !monedaId) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }

    // Validar tipo de movimiento
    const tiposValidos = ['INGRESO', 'EGRESO', 'TRANSFERENCIA_ENTRANTE', 'TRANSFERENCIA_SALIENTE']
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de movimiento inválido' })
    }

    // Crear el movimiento
    await prisma.movimiento.create({
      data: {
        tipo,
        monto: parseFloat(monto),
        monedaId,
        usuarioId: decoded.id,
        puntoAtencionId: decoded.punto_atencion_id,
        descripcion: descripcion || '',
      },
    })

    return res.status(200).json({ mensaje: 'Movimiento registrado correctamente' })
  } catch (err) {
    console.error('Error al registrar movimiento:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
