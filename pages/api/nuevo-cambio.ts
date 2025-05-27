// ✅ pages/api/nuevo-cambio.ts con actualización automática de saldo
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { obtenerUsuarioDesdeRequest } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const usuario = obtenerUsuarioDesdeRequest(req)
  if (!usuario || !usuario.punto_atencion_id) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const {
    tipoOperacion,
    monedaOrigen,
    monedaDestino,
    montoOrigen,
    tasaCambio,
    observacion,
  } = req.body

  if (!tipoOperacion || !monedaOrigen || !monedaDestino || !montoOrigen || !tasaCambio) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' })
  }

  const monto = parseFloat(String(montoOrigen).replace(',', '.'))
  const tasa = parseFloat(String(tasaCambio).replace(',', '.'))

  if (isNaN(monto) || isNaN(tasa)) {
    return res.status(400).json({ error: 'Monto o tasa inválida' })
  }

  if (monedaOrigen === monedaDestino) {
    return res.status(400).json({ error: 'La moneda origen y destino no pueden ser iguales' })
  }

  const montoDestino = tipoOperacion === 'COMPRA' ? monto * tasa : monto / tasa

  try {
    const cambio = await prisma.cambioDivisa.create({
      data: {
        puntoAtencionId: usuario.punto_atencion_id,
        usuarioId: usuario.id,
        tipoOperacion,
        monedaOrigenId: monedaOrigen,
        monedaDestinoId: monedaDestino,
        montoOrigen: monto,
        tasaCambio: tasa,
        montoDestino: parseFloat(montoDestino.toFixed(2)),
        observacion,
      },
    })

    // Movimiento por el monto origen
    await prisma.movimiento.create({
      data: {
        tipo: 'CAMBIO_DIVISA',
        monto,
        monedaId: monedaOrigen,
        usuarioId: usuario.id,
        puntoAtencionId: usuario.punto_atencion_id,
        descripcion: `Cambio de divisa (${tipoOperacion})`,
      },
    })

    // Actualizar saldos
    // 1. Restar del saldo origen
    await prisma.saldo.upsert({
      where: {
        puntoAtencionId_monedaId: {
          puntoAtencionId: usuario.punto_atencion_id,
          monedaId: monedaOrigen,
        },
      },
      update: {
        cantidad: {
          decrement: monto,
        },
      },
      create: {
        puntoAtencionId: usuario.punto_atencion_id,
        monedaId: monedaOrigen,
        cantidad: 0,
      },
    })

    // 2. Sumar al saldo destino
    await prisma.saldo.upsert({
      where: {
        puntoAtencionId_monedaId: {
          puntoAtencionId: usuario.punto_atencion_id,
          monedaId: monedaDestino,
        },
      },
      update: {
        cantidad: {
          increment: parseFloat(montoDestino.toFixed(2)),
        },
      },
      create: {
        puntoAtencionId: usuario.punto_atencion_id,
        monedaId: monedaDestino,
        cantidad: parseFloat(montoDestino.toFixed(2)),
      },
    })

    return res.status(200).json({ mensaje: 'Cambio y saldos actualizados correctamente', id: cambio.id })
  } catch (error) {
    console.error('Error al registrar cambio:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
