import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generarToken } from '@/utils/jwt'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { usuario, clave } = req.body

  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  try {
    const user = await prisma.usuarios.findUnique({
      where: { usuario },
    })

    if (!user || !(await bcrypt.compare(clave, user.clave))) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = generarToken({
      userId: user.id,
      role: user.rol as 'ADMIN' | 'EMPLEADO',
      punto_atencion_id: user.punto_atencion_id || null,
    })

    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
    )

    return res.status(200).json({
      mensaje: 'Login exitoso',
      usuario: { id: user.id, nombre: user.nombre, rol: user.rol },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
