import bcrypt from 'bcrypt'
import db from '../config/db.js'

const run = async () => {
  const [,, username, password, rol] = process.argv

  const hash = await bcrypt.hash(password, 10)

  await db.query(
    'INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)',
    [username, hash, rol || 'user']
  )

  console.log('✅ Usuario creado')
  process.exit()
}

run()
