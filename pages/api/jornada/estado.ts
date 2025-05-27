import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.cookie ? parse(req.headers.cookie).token : null
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      punto_atencion_id?: string | null
    }

    if (!decoded.punto_atencion_id) {
      return res.status(400).json({ error: 'Punto de atención no asignado' })
    }

    const jornada = await prisma.jornada.findFirst({
      where: {
        usuarioId: decoded.id,
        puntoAtencionId: decoded.punto_atencion_id,
      },
      orderBy: {
        fechaInicio: 'desc',
      },
    })

    return res.status(200).json({
      inicio: jornada?.fechaInicio || null,
      salida_almuerzo: jornada?.fechaAlmuerzo || null,
      regreso_almuerzo: jornada?.fechaRegreso || null,
      fin: jornada?.fechaSalida || null,
    })
  } catch (err) {
    console.error('Error en /api/jornada/estado:', err)
    return res.status(500).json({ error: 'Error al obtener jornada' })
  }
}
