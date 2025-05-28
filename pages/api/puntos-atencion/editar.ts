// pages/api/puntos-atencion/editar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { id, nombre, direccion, ciudad, provincia, codigoPostal } = req.body

  if (!id || !nombre || !direccion || !ciudad || !provincia || !codigoPostal) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }

  try {
    const puntoExistente = await prisma.puntoAtencion.findUnique({ where: { id } })

    if (!puntoExistente) {
      return res.status(404).json({ error: 'Punto de atención no encontrado' })
    }

    const puntoActualizado = await prisma.puntoAtencion.update({
      where: { id },
      data: {
        nombre,
        direccion,
        ciudad,
        provincia,
        codigoPostal,
      },
    })

    return res.status(200).json(puntoActualizado)
  } catch (error) {
    console.error('Error al editar punto de atención:', error)
    return res.status(500).json({ error: 'Error al editar punto de atención' })
  }
}
