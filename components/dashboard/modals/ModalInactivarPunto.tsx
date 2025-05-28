 'use client'
 
 import { useEffect } from 'react'
 import { type PuntoAtencion } from '@/shared/types'
 
 interface Props {
   punto: PuntoAtencion
   onClose: () => void
   onSave: () => void
 }
 
 export default function ModalPruebaInactivar({ punto, onClose, onSave }: Props) {
   useEffect(() => {
     console.log('🟢 Modal PRUEBA montado')
   }, [])
 
   const handleInactivar = async () => {
     console.log('👆 clic recibido - PRUEBA')
     try {
       const res = await fetch('/api/puntos-atencion/inactivar', {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ id: punto.id }),
       })
 
       if (!res.ok) {
         const data = await res.json()
         console.error('❌ Error:', data.error || 'Error desconocido')
       } else {
         console.log('✅ Inactivación completada')
         onSave()
         onClose()
       }
     } catch (err) {
       console.error('❌ Error de red:', err)
     }
   }
 
   return (
     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999]">
       <div className="bg-white rounded p-6 shadow-xl w-full max-w-md space-y-4">
         <h3 className="text-lg font-bold">Modal PRUEBA Inactivar</h3>
         <p>¿Seguro que quieres inactivar <strong>{punto.nombre}</strong>?</p>
         <div className="flex justify-end gap-3 pt-4">
           <button
             onClick={onClose}
             className="px-4 py-2 border border-gray-300 rounded"
           >
             Cancelar
           </button>
           <button
             onClick={handleInactivar}
             className="px-4 py-2 bg-red-600 text-white rounded"
           >
             Inactivar
           </button>
         </div>
       </div>
     </div>
   )
 }
 