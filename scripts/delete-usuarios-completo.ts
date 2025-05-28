// scripts/delete-usuarios-completo.ts
import { prisma } from '../lib/prisma'

async function main() {
  // Eliminar dependencias primero
  await prisma.jornada.deleteMany()
  await prisma.cambioDivisa.deleteMany()
  await prisma.movimiento.deleteMany()
  await prisma.solicitudSaldo.deleteMany()
  await prisma.cuadreCaja.deleteMany()
  // Finalmente eliminar usuarios
  await prisma.usuario.deleteMany()

  console.log('✅ Todos los usuarios y registros relacionados fueron eliminados')
}

main()
  .catch((e) => {
    console.error('❌ Error al eliminar:', e)
  })
  .finally(() => {
    prisma.$disconnect()
  })
