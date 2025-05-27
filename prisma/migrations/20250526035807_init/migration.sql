/*
  Warnings:

  - You are about to drop the `cambios_divisas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cuadres_caja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jornadas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `monedas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `movimientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `puntos_atencion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recibos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `saldos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `solicitudes_saldo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuarios` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA_ENTRANTE', 'TRANSFERENCIA_SALIENTE', 'CAMBIO_DIVISA');

-- DropForeignKey
ALTER TABLE "cambios_divisas" DROP CONSTRAINT "cambios_divisas_moneda_destino_id_fkey";

-- DropForeignKey
ALTER TABLE "cambios_divisas" DROP CONSTRAINT "cambios_divisas_moneda_origen_id_fkey";

-- DropForeignKey
ALTER TABLE "cambios_divisas" DROP CONSTRAINT "cambios_divisas_punto_atencion_id_fkey";

-- DropForeignKey
ALTER TABLE "cambios_divisas" DROP CONSTRAINT "cambios_divisas_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "cuadres_caja" DROP CONSTRAINT "cuadres_caja_aprobado_por_fkey";

-- DropForeignKey
ALTER TABLE "cuadres_caja" DROP CONSTRAINT "cuadres_caja_punto_atencion_id_fkey";

-- DropForeignKey
ALTER TABLE "cuadres_caja" DROP CONSTRAINT "cuadres_caja_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_autorizado_por_fkey";

-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_desde_punto_fkey";

-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_generado_por_fkey";

-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_hacia_punto_fkey";

-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_moneda_id_fkey";

-- DropForeignKey
ALTER TABLE "recibos" DROP CONSTRAINT "recibos_movimiento_id_fkey";

-- DropForeignKey
ALTER TABLE "saldos" DROP CONSTRAINT "saldos_moneda_id_fkey";

-- DropForeignKey
ALTER TABLE "saldos" DROP CONSTRAINT "saldos_punto_atencion_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes_saldo" DROP CONSTRAINT "solicitudes_saldo_aprobado_por_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes_saldo" DROP CONSTRAINT "solicitudes_saldo_moneda_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes_saldo" DROP CONSTRAINT "solicitudes_saldo_punto_atencion_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes_saldo" DROP CONSTRAINT "solicitudes_saldo_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_punto_atencion_id_fkey";

-- DropTable
DROP TABLE "cambios_divisas";

-- DropTable
DROP TABLE "cuadres_caja";

-- DropTable
DROP TABLE "jornadas";

-- DropTable
DROP TABLE "monedas";

-- DropTable
DROP TABLE "movimientos";

-- DropTable
DROP TABLE "puntos_atencion";

-- DropTable
DROP TABLE "recibos";

-- DropTable
DROP TABLE "saldos";

-- DropTable
DROP TABLE "solicitudes_saldo";

-- DropTable
DROP TABLE "usuarios";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuntoAtencion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PuntoAtencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moneda" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "simbolo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,

    CONSTRAINT "Moneda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CambioDivisa" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoOrigen" DOUBLE PRECISION NOT NULL,
    "montoDestino" DOUBLE PRECISION NOT NULL,
    "tasaCambio" DOUBLE PRECISION NOT NULL,
    "monedaOrigenId" TEXT NOT NULL,
    "monedaDestinoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "puntoAtencionId" TEXT NOT NULL,

    CONSTRAINT "CambioDivisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recibo" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenido" TEXT NOT NULL,
    "cambioId" TEXT,

    CONSTRAINT "Recibo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saldo" (
    "id" TEXT NOT NULL,
    "puntoAtencionId" TEXT NOT NULL,
    "monedaId" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Saldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "monedaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "puntoAtencionId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudSaldo" (
    "id" TEXT NOT NULL,
    "puntoAtencionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "monedaId" TEXT NOT NULL,
    "montoSolicitado" DOUBLE PRECISION NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRespuesta" TIMESTAMP(3),

    CONSTRAINT "SolicitudSaldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jornada" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "puntoAtencionId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAlmuerzo" TIMESTAMP(3),
    "fechaRegreso" TIMESTAMP(3),
    "fechaSalida" TIMESTAMP(3),

    CONSTRAINT "Jornada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transferencia" (
    "id" TEXT NOT NULL,
    "origenId" TEXT NOT NULL,
    "destinoId" TEXT NOT NULL,
    "monedaId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT,

    CONSTRAINT "Transferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuadreCaja" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "puntoAtencionId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEntradas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSalidas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldoFinal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observaciones" TEXT,

    CONSTRAINT "CuadreCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Moneda_codigo_key" ON "Moneda"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Recibo_cambioId_key" ON "Recibo"("cambioId");

-- AddForeignKey
ALTER TABLE "CambioDivisa" ADD CONSTRAINT "CambioDivisa_monedaDestinoId_fkey" FOREIGN KEY ("monedaDestinoId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioDivisa" ADD CONSTRAINT "CambioDivisa_monedaOrigenId_fkey" FOREIGN KEY ("monedaOrigenId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioDivisa" ADD CONSTRAINT "CambioDivisa_puntoAtencionId_fkey" FOREIGN KEY ("puntoAtencionId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioDivisa" ADD CONSTRAINT "CambioDivisa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recibo" ADD CONSTRAINT "Recibo_cambioId_fkey" FOREIGN KEY ("cambioId") REFERENCES "CambioDivisa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saldo" ADD CONSTRAINT "Saldo_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saldo" ADD CONSTRAINT "Saldo_puntoAtencionId_fkey" FOREIGN KEY ("puntoAtencionId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_puntoAtencionId_fkey" FOREIGN KEY ("puntoAtencionId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudSaldo" ADD CONSTRAINT "SolicitudSaldo_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudSaldo" ADD CONSTRAINT "SolicitudSaldo_puntoAtencionId_fkey" FOREIGN KEY ("puntoAtencionId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudSaldo" ADD CONSTRAINT "SolicitudSaldo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_puntoAtencionId_fkey" FOREIGN KEY ("puntoAtencionId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jornada" ADD CONSTRAINT "Jornada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Moneda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transferencia" ADD CONSTRAINT "Transferencia_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuadreCaja" ADD CONSTRAINT "CuadreCaja_puntoAtencionId_fkey" FOREIGN KEY ("puntoAtencionId") REFERENCES "PuntoAtencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuadreCaja" ADD CONSTRAINT "CuadreCaja_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
