// pages/api/admin/usuarios.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { verificarAdmin } from '@/utils/verificar-admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const admin = verificarAdmin(req)
  if (!admin) return res.status(403).json({ error: 'No autorizado' })

  const { nombre, usuario, correo, clave, rol, punto_atencion_id } = req.body
  if (!nombre || !usuario || !correo || !clave || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const claveHasheada = await bcrypt.hash(clave, 10)

  try {
    const nuevoUsuario = await prisma.usuarios.create({
      data: {
        nombre,
        usuario,
        correo,
        clave: claveHasheada,
        rol,
        punto_atencion_id: punto_atencion_id || null,
      },
    })

    return res.status(201).json({ mensaje: 'Usuario creado', usuario: nuevoUsuario })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({ error: 'Error al crear usuario' })
  }
}
