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

  if (
    !tipoOperacion ||
    !monedaOrigen ||
    !monedaDestino ||
    !montoOrigen ||
    !tasaCambio
  ) {
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

  const montoDestino = tipoOperacion === 'COMPRA'
    ? monto * tasa
    : monto / tasa

  try {
    const cambio = await prisma.cambiosDivisas.create({
      data: {
        punto_atencion_id: usuario.punto_atencion_id,
        usuario_id: usuario.userId,
        tipo_operacion: tipoOperacion,
        moneda_origen_id: monedaOrigen,
        moneda_destino_id: monedaDestino,
        monto_origen: monto,
        tasa_cambio: tasa,
        monto_destino: parseFloat(montoDestino.toFixed(2)),
        observacion,
      },
    })

    return res.status(200).json({ mensaje: 'Cambio registrado correctamente', id: cambio.id })
  } catch (error) {
    console.error('Error al registrar cambio:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
