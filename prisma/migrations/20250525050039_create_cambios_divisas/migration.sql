-- CreateTable
CREATE TABLE "cambios_divisas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "punto_atencion_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "tipo_operacion" TEXT NOT NULL,
    "moneda_origen_id" UUID NOT NULL,
    "moneda_destino_id" UUID NOT NULL,
    "monto_origen" DECIMAL(20,2) NOT NULL,
    "tasa_cambio" DECIMAL(20,6) NOT NULL,
    "monto_destino" DECIMAL(20,2) NOT NULL,
    "observacion" TEXT,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambios_divisas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cambios_divisas" ADD CONSTRAINT "cambios_divisas_punto_atencion_id_fkey" FOREIGN KEY ("punto_atencion_id") REFERENCES "puntos_atencion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_divisas" ADD CONSTRAINT "cambios_divisas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_divisas" ADD CONSTRAINT "cambios_divisas_moneda_origen_id_fkey" FOREIGN KEY ("moneda_origen_id") REFERENCES "monedas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_divisas" ADD CONSTRAINT "cambios_divisas_moneda_destino_id_fkey" FOREIGN KEY ("moneda_destino_id") REFERENCES "monedas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
