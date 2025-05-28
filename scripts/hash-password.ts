// scripts/hash-password.ts
import bcrypt from 'bcryptjs'

const password = '12345' // ⬅️ Cambia esta contraseña por la que tú quieras

bcrypt.hash(password, 10).then((hash) => {
  console.log('Contraseña encriptada:')
  console.log(hash)
})
