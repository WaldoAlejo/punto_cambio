/*
  Warnings:

  - Added the required column `tipoOperacion` to the `CambioDivisa` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('COMPRA', 'VENTA');

-- AlterTable
ALTER TABLE "CambioDivisa" ADD COLUMN     "tipoOperacion" "TipoOperacion" NOT NULL;
