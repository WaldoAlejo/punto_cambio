export interface Usuario {
  id: string
  username: string
  nombre: string
  rol: 'ADMIN' | 'OPERADOR'
}

export interface PuntoAtencion {
  id: string
  nombre: string
  direccion: string
  ciudad: string
  provincia: string
  codigoPostal: string
  activo: boolean
}
