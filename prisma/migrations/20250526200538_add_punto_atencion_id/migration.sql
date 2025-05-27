/*
  Warnings:

  - You are about to drop the column `observaciones` on the `CuadreCaja` table. All the data in the column will be lost.
  - You are about to drop the column `saldoFinal` on the `CuadreCaja` table. All the data in the column will be lost.
  - You are about to drop the column `totalEntradas` on the `CuadreCaja` table. All the data in the column will be lost.
  - You are about to drop the column `totalSalidas` on the `CuadreCaja` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CuadreCaja" DROP COLUMN "observaciones",
DROP COLUMN "saldoFinal",
DROP COLUMN "totalEntradas",
DROP COLUMN "totalSalidas";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "punto_atencion_id" TEXT;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_punto_atencion_id_fkey" FOREIGN KEY ("punto_atencion_id") REFERENCES "PuntoAtencion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
