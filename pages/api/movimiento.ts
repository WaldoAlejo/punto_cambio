import type { NextApiRequest, NextApiResponse } from 'next'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const usuario = obtenerUsuarioDesdeRequest(req)
  if (!usuario) return res.status(401).json({ error: 'No autenticado' })

  const { tipo, monto, moneda, observacion } = req.body

  if (!tipo || !monto || !moneda) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  try {
    // Buscar moneda por código
    const monedaDb = await prisma.monedas.findUnique({
      where: { codigo: moneda },
    })

    if (!monedaDb) {
      return res.status(404).json({ error: 'Moneda no encontrada' })
    }

    // Insertar movimiento
    const movimiento = await prisma.movimientos.create({
      data: {
        tipo,
        monto: parseFloat(monto),
        moneda_id: monedaDb.id,
        desde_punto: tipo === 'VENTA' ? usuario.punto_atencion_id : null,
        hacia_punto: tipo === 'COMPRA' ? usuario.punto_atencion_id : null,
        generado_por: usuario.userId,
        observacion,
      },
    })

    // Insertar recibo vinculado (tipo = "MOVIMIENTO")
    await prisma.recibos.create({
      data: {
        tipo: 'MOVIMIENTO',
        movimiento_id: movimiento.id,
        archivo_path: null, // puedes actualizar luego con el path real
      },
    })

    return res.status(200).json({ mensaje: 'Movimiento y recibo registrados' })
  } catch (error) {
    console.error('Error al registrar movimiento:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
