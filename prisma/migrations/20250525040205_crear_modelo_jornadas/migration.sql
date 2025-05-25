-- CreateTable
CREATE TABLE "cuadres_caja" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "punto_atencion_id" UUID,
    "usuario_id" UUID,
    "fecha" DATE NOT NULL,
    "total_entradas" DECIMAL(20,2) DEFAULT 0,
    "total_salidas" DECIMAL(20,2) DEFAULT 0,
    "saldo_final" DECIMAL(20,2) DEFAULT 0,
    "observaciones" TEXT,
    "aprobado_por" UUID,
    "aprobado_en" TIMESTAMP(6),
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuadres_caja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monedas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "es_principal" BOOLEAN DEFAULT false,

    CONSTRAINT "monedas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo" TEXT NOT NULL,
    "monto" DECIMAL(20,2) NOT NULL,
    "moneda_id" UUID,
    "desde_punto" UUID,
    "hacia_punto" UUID,
    "autorizado_por" UUID,
    "generado_por" UUID,
    "observacion" TEXT,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_atencion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puntos_atencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recibos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "movimiento_id" UUID,
    "tipo" TEXT NOT NULL,
    "archivo_path" TEXT,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recibos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "punto_atencion_id" UUID,
    "moneda_id" UUID,
    "cantidad" DECIMAL(20,2) DEFAULT 0,
    "actualizado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saldos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_saldo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID,
    "punto_atencion_id" UUID,
    "moneda_id" UUID,
    "monto" DECIMAL(20,2) NOT NULL,
    "estado" TEXT DEFAULT 'PENDIENTE',
    "observacion" TEXT,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "aprobado_por" UUID,
    "aprobado_en" TIMESTAMP(6),

    CONSTRAINT "solicitudes_saldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "punto_atencion_id" UUID,
    "creado_en" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jornadas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "punto_atencion_id" UUID NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_inicio" TIMESTAMP(3),
    "hora_salida_almuerzo" TIMESTAMP(3),
    "hora_regreso_almuerzo" TIMESTAMP(3),
    "hora_fin" TIMESTAMP(3),

    CONSTRAINT "jornadas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuadres_caja_punto_atencion_id_fecha_key" ON "cuadres_caja"("punto_atencion_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "monedas_codigo_key" ON "monedas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "saldos_punto_atencion_id_moneda_id_key" ON "saldos"("punto_atencion_id", "moneda_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_usuario_key" ON "usuarios"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "cuadres_caja" ADD CONSTRAINT "cuadres_caja_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadres_caja" ADD CONSTRAINT "cuadres_caja_punto_atencion_id_fkey" FOREIGN KEY ("punto_atencion_id") REFERENCES "puntos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadres_caja" ADD CONSTRAINT "cuadres_caja_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_autorizado_por_fkey" FOREIGN KEY ("autorizado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_desde_punto_fkey" FOREIGN KEY ("desde_punto") REFERENCES "puntos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_generado_por_fkey" FOREIGN KEY ("generado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_hacia_punto_fkey" FOREIGN KEY ("hacia_punto") REFERENCES "puntos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_moneda_id_fkey" FOREIGN KEY ("moneda_id") REFERENCES "monedas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_movimiento_id_fkey" FOREIGN KEY ("movimiento_id") REFERENCES "movimientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldos" ADD CONSTRAINT "saldos_moneda_id_fkey" FOREIGN KEY ("moneda_id") REFERENCES "monedas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldos" ADD CONSTRAINT "saldos_punto_atencion_id_fkey" FOREIGN KEY ("punto_atencion_id") REFERENCES "puntos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_saldo" ADD CONSTRAINT "solicitudes_saldo_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_saldo" ADD CONSTRAINT "solicitudes_saldo_moneda_id_fkey" FOREIGN KEY ("moneda_id") REFERENCES "monedas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_saldo" ADD CONSTRAINT "solicitudes_saldo_punto_atencion_id_fkey" FOREIGN KEY ("punto_atencion_id") REFERENCES "puntos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_saldo" ADD CONSTRAINT "solicitudes_saldo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_punto_atencion_id_fkey" FOREIGN KEY ("punto_atencion_id") REFERENCES "puntos_atencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
