import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const puntos = await prisma.puntoAtencion.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        direccion: true,
        ciudad: true,
        provincia: true,
        codigoPostal: true,
      },
    })

    return res.status(200).json(puntos)
  } catch (error) {
    console.error('Error al listar puntos de atención:', error)
    return res.status(500).json({ error: 'Error al listar puntos de atención' })
  }
}
