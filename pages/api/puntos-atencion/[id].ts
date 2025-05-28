// pages/api/admin/puntos-atencion/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { nombre, direccion, ciudad, provincia, codigoPostal } = req.body

  try {
    const punto = await prisma.puntoAtencion.update({
      where: { id: id as string },
      data: {
        nombre,
        direccion,
        ciudad,
        provincia,
        codigoPostal,
      },
    })

    return res.status(200).json(punto)
  } catch (error) {
    console.error('Error al actualizar punto de atención:', error)
    return res.status(500).json({ error: 'Error interno al actualizar' })
  }
}
