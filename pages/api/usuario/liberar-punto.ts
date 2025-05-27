// pages/api/usuarios/liberar-punto.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const usuario = obtenerUsuarioDesdeRequest(req)
  if (!usuario) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  try {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { punto_atencion_id: null },
    })

    return res.status(200).json({ mensaje: 'Punto de atención liberado correctamente' })
  } catch (error) {
    console.error('Error al liberar punto:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
