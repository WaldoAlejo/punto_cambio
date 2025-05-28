// pages/api/puntos-atencion/inactivar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { id } = req.body

  if (!id) {
    return res.status(400).json({ error: 'El ID del punto de atención es obligatorio' })
  }

  try {
    const punto = await prisma.puntoAtencion.findUnique({ where: { id } })

    if (!punto) {
      return res.status(404).json({ error: 'Punto de atención no encontrado' })
    }

    const puntoInactivado = await prisma.puntoAtencion.update({
      where: { id },
      data: { activo: false },
    })

    return res.status(200).json(puntoInactivado)
  } catch (error) {
    console.error('Error al inactivar punto de atención:', error)
    return res.status(500).json({ error: 'Error interno al inactivar el punto de atención' })
  }
}
