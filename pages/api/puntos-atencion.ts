// pages/api/puntos-atencion.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const puntos = await prisma.puntos_atencion.findMany({
      select: {
        id: true,
        nombre: true,
        direccion: true,
      },
      orderBy: { nombre: 'asc' },
    })

    return res.status(200).json(puntos)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al obtener puntos de atención' })
  }
}
