// pages/api/perfil.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const usuarioToken = obtenerUsuarioDesdeRequest(req)

  if (!usuarioToken) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioToken.id },
      select: {
        id: true,
        nombre: true,
        rol: true,
        punto_atencion_id: true,
        puntoAtencion: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const respuestaBase = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      punto_atencion_id: usuario.punto_atencion_id,
      punto_atencion: usuario.puntoAtencion,
    }

    // 🚩 Personalización por rol
    if (usuario.rol === 'ADMIN') {
      return res.status(200).json({
        mensaje: 'Admin autenticado',
        tipo: 'ADMIN',
        usuario: respuestaBase,
        puede_ver_menu_admin: true,
      })
    }

    if (usuario.rol === 'OPERADOR') {
      return res.status(200).json({
        mensaje: 'Empleado autenticado',
        tipo: 'OPERADOR',
        usuario: respuestaBase,
        requiere_punto: !usuario.punto_atencion_id,
      })
    }

    // Rol no reconocido (por si se añade uno nuevo incorrectamente)
    return res.status(400).json({ error: 'Rol de usuario no válido' })
  } catch (error) {
    console.error('Error en /api/perfil:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
