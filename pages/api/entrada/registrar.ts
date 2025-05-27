// ✅ /pages/api/entrada/registrar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const usuario = obtenerUsuarioDesdeRequest(req)
  if (!usuario || !usuario.punto_atencion_id) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const { monto, monedaId, descripcion } = req.body
  if (!monto || !monedaId) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' })
  }

  try {
    await prisma.movimiento.create({
      data: {
        tipo: 'INGRESO',
        monto: parseFloat(monto),
        monedaId,
        usuarioId: usuario.id,
        puntoAtencionId: usuario.punto_atencion_id,
        descripcion: descripcion || '',
      },
    })

    await prisma.saldo.upsert({
      where: {
        puntoAtencionId_monedaId: {
          puntoAtencionId: usuario.punto_atencion_id,
          monedaId,
        },
      },
      update: {
        cantidad: {
          increment: parseFloat(monto),
        },
      },
      create: {
        puntoAtencionId: usuario.punto_atencion_id,
        monedaId,
        cantidad: parseFloat(monto),
      },
    })

    return res.status(200).json({ mensaje: 'Entrada registrada correctamente' })
  } catch (error) {
    console.error('Error al registrar entrada:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
