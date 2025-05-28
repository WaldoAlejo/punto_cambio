import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verificarAdmin } from '@/utils/verificar-admin'
import { Prisma } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const admin = verificarAdmin(req)
  if (!admin) return res.status(403).json({ error: 'No autorizado' })

  const { nombre, usuario, correo, clave, rol, punto_atencion_id } = req.body

  if (!nombre || !usuario || !clave || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  try {
    // Verificar si el username ya existe
    const existeUsuario = await prisma.usuario.findUnique({
      where: { username: usuario },
    })

    if (existeUsuario) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese nombre de usuario' })
    }

    // Verificar si el correo ya existe (si fue proporcionado)
    if (correo) {
      const existeCorreo = await prisma.usuario.findUnique({
        where: { correo },
      })

      if (existeCorreo) {
        return res.status(400).json({ error: 'Ya existe un usuario con ese correo electrónico' })
      }
    }

    const claveHasheada = await bcrypt.hash(clave, 10)

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        username: usuario,
        password: claveHasheada,
        rol,
        correo: correo || null,
        punto_atencion_id: punto_atencion_id || null,
      },
    })

    return res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        username: nuevoUsuario.username,
        rol: nuevoUsuario.rol,
      },
    })
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return res.status(400).json({ error: 'Usuario o correo ya registrados' })
    }

    console.error('Error al crear usuario:', err)
    return res.status(500).json({ error: 'Error interno al crear usuario' })
  }
}
