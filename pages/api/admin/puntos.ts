import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { nombre, direccion, ciudad, provincia, codigoPostal } = req.body

  if (!nombre || !direccion || !ciudad || !provincia || !codigoPostal) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' })
  }

  try {
    const nuevo = await prisma.puntoAtencion.create({
      data: {
        nombre,
        direccion,
        ciudad,
        provincia,
        codigoPostal,
      },
    })

    return res.status(201).json(nuevo)
  } catch (err) {
    console.error('Error al crear punto de atención:', err)
    return res.status(500).json({ error: 'Error al crear punto de atención' })
  }
}
