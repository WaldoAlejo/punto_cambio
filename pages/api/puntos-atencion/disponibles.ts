// pages/api/puntos-atencion/disponibles.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  try {
    // Obtener IDs de puntos ya ocupados por usuarios activos
    const usuariosActivos = await prisma.usuarios.findMany({
      where: {
        punto_atencion_id: { not: null },
      },
      select: {
        punto_atencion_id: true,
      },
    })

    const ocupados = usuariosActivos.map(
      (u: { punto_atencion_id: string | null }) => u.punto_atencion_id
    )

    // Retornar puntos que NO estén ocupados
    const disponibles = await prisma.puntos_atencion.findMany({
      where: {
        id: { notIn: ocupados.filter(Boolean) as string[] },
      },
      select: {
        id: true,
        nombre: true,
        direccion: true,
      },
      orderBy: { nombre: 'asc' },
    })

    return res.status(200).json(disponibles)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error al obtener puntos disponibles' })
  }
}
