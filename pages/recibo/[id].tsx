
// ✅ pages/recibo/[id].tsx
import { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { formatWithOptions } from 'date-fns/fp'
import { es } from 'date-fns/locale'
import { useEffect } from 'react'

type Props = {
  cambio: {
    id: string
    tipo_operacion: string
    creado_en: string
    punto: string
    usuario: string
    moneda_origen: string
    moneda_destino: string
    monto_origen: string
    monto_destino: string
    tasa: string
    observacion: string | null
  }
}

export default function ReciboPage({ cambio }: Props) {
  useEffect(() => {
    const handleAfterPrint = () => {
      window.location.href = '/nuevo-cambio'
    }

    window.addEventListener('afterprint', handleAfterPrint)
    window.print()

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '250px',
        margin: '0 auto',
        whiteSpace: 'pre-wrap',
      }}
    >
      {/* COPIA CLIENTE */}
      <div>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>PUBTOB CAMBIO</h3>
        <p><strong>COPIA CLIENTE</strong></p>
        <p><strong>Recibo Nº:</strong> {cambio.id}</p>
        <p><strong>Fecha:</strong> {cambio.creado_en}</p>
        <p><strong>Punto:</strong> {cambio.punto}</p>
        <p><strong>Atiende:</strong> {cambio.usuario}</p>
        <hr />
        <p><strong>Operación:</strong> {cambio.tipo_operacion}</p>
        <p><strong>Origen:</strong> {cambio.moneda_origen}</p>
        <p><strong>Destino:</strong> {cambio.moneda_destino}</p>
        <p><strong>Monto origen:</strong> {cambio.monto_origen}</p>
        <p><strong>Tasa cambio:</strong> {cambio.tasa}</p>
        <p><strong>Monto destino:</strong> {cambio.monto_destino}</p>
        {cambio.observacion && <p><strong>Obs:</strong> {cambio.observacion}</p>}
        <hr />
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>¡Gracias por su preferencia!</p>
      </div>

      <hr style={{ margin: '1rem 0', borderTop: 'dashed 1px black' }} />

      {/* COPIA ARCHIVO */}
      <div>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>PUBTOB CAMBIO</h3>
        <p><strong>COPIA ARCHIVO</strong></p>
        <p><strong>Recibo Nº:</strong> {cambio.id}</p>
        <p><strong>Fecha:</strong> {cambio.creado_en}</p>
        <p><strong>Punto:</strong> {cambio.punto}</p>
        <p><strong>Atiende:</strong> {cambio.usuario}</p>
        <hr />
        <p><strong>Operación:</strong> {cambio.tipo_operacion}</p>
        <p><strong>Origen:</strong> {cambio.moneda_origen}</p>
        <p><strong>Destino:</strong> {cambio.moneda_destino}</p>
        <p><strong>Monto origen:</strong> {cambio.monto_origen}</p>
        <p><strong>Tasa cambio:</strong> {cambio.tasa}</p>
        <p><strong>Monto destino:</strong> {cambio.monto_destino}</p>
        {cambio.observacion && <p><strong>Obs:</strong> {cambio.observacion}</p>}
        <hr />
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>Copia para archivo interno</p>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query

  const cambio = await prisma.cambios_divisas.findUnique({
    where: { id: String(id) },
    include: {
      monedas_origen: true,
      monedas_destino: true,
      puntos_atencion: true,
      usuarios: true,
    },
  })

  if (!cambio) {
    return { notFound: true }
  }

  const formatFecha = formatWithOptions({ locale: es }, 'dd/MM/yyyy HH:mm')
  const fecha = formatFecha(new Date(cambio.creado_en))

  return {
    props: {
      cambio: {
        id: cambio.id,
        tipo_operacion: cambio.tipo_operacion,
        creado_en: fecha,
        punto: cambio.puntos_atencion?.nombre || '---',
        usuario: cambio.usuarios?.nombre || '---',
        moneda_origen: cambio.monedas_origen?.codigo || '---',
        moneda_destino: cambio.monedas_destino?.codigo || '---',
        monto_origen: Number(cambio.monto_origen).toFixed(2),
        tasa: Number(cambio.tasa_cambio).toFixed(4),
        monto_destino: Number(cambio.monto_destino).toFixed(2),
        observacion: cambio.observacion || null,
      },
    },
  }
}
