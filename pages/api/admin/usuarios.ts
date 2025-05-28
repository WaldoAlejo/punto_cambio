// pages/api/admin/usuarios.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nombre, usuario, correo, clave, rol, punto_atencion_id } = req.body

  try {
    // Verificar si ya existe el usuario
    const existente = await prisma.usuario.findUnique({
      where: { username: usuario },
    })

    if (existente) {
      return res.status(400).json({ error: 'El usuario ya existe' })
    }

    // Encriptar la contraseña antes de guardar
    const passwordHasheado = await bcrypt.hash(clave, 10)

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        username: usuario,
        correo,
        password: passwordHasheado,
        rol,
        punto_atencion_id: punto_atencion_id || null,
      },
    })

    return res.status(201).json({ mensaje: 'Usuario creado', usuario: nuevoUsuario })
  } catch (error) {
    console.error('Error creando usuario:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
