import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verificarAdmin } from '@/utils/verificar-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const admin = verificarAdmin(req)
  if (!admin) {
    return res.status(403).json({ error: 'No autorizado' })
  }

  const { id } = req.body

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de usuario inválido' })
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
    })

    return res.status(200).json({ message: 'Usuario desactivado', usuario })
  } catch (error) {
    console.error('Error al desactivar usuario:', error)
    return res.status(500).json({ error: 'Error interno al desactivar usuario' })
  }
}
