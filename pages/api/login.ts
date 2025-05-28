// pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { generarToken } from '@/utils/jwt'
import { serialize } from 'cookie'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { usuario, clave } = req.body

  if (!usuario || !clave) {
    return res.status(400).json({ error: 'Usuario y clave son requeridos' })
  }

  try {
    // Buscar usuario por nombre de usuario
    const user = await prisma.usuario.findUnique({
      where: { username: usuario },
    })

    // Validaciones
    if (!user || !(await bcrypt.compare(clave, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    if (!user.activo) {
      return res.status(403).json({ error: 'El usuario está inactivo' })
    }

    // Generar token JWT
    const token = generarToken({
      id: user.id,
      rol: user.rol,
      punto_atencion_id: user.punto_atencion_id ?? null,
    })

    // Establecer cookie segura
    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    )

    return res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        punto_atencion_id: user.punto_atencion_id,
      },
    })
  } catch (error) {
    console.error('Error en /api/login:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
