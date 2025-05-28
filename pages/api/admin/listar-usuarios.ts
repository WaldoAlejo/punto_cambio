// pages/api/admin/listar-usuarios.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verificarToken } from '@/utils/jwt'
import { parse } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end() // Método no permitido
  }

  try {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
    const token = cookies.token

    if (!token) {
      return res.status(401).json({ error: 'No autorizado: sin token' })
    }

    const payload = verificarToken(token)

    if (payload.rol !== 'ADMIN') {
      return res.status(403).json({ error: 'No autorizado: no es administrador' })
    }

    const usuarios = await prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        username: true,
        nombre: true,
        rol: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    })

    return res.status(200).json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    return res.status(500).json({ error: 'Error interno al listar usuarios' })
  }
}
