/*
  Warnings:

  - A unique constraint covering the columns `[puntoAtencionId,monedaId]` on the table `Saldo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Saldo_puntoAtencionId_monedaId_key" ON "Saldo"("puntoAtencionId", "monedaId");
