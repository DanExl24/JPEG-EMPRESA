import prisma from '../lib/db.js'
import { hashPassword } from '../lib/password.js'

function isValidPassword(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[@#$%&*]/.test(password);
}

export async function createUser(req, res) {
  const { nombre, apellido, cedula, correo, password, rol } = req.body;
  if (!nombre || !apellido || !cedula || !correo || !password || !rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' })
  }
  
  if (!['ADMIN', 'INSTRUCTOR'].includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido para este endpoint.' })
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'La contraseña no cumple los requisitos.' })
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ correo }, { cedula }] }
  })

  if (existing) {
    return res.status(400).json({ message: 'El usuario ya existe (correo o cédula duplicada).' })
  }

  await prisma.user.create({
    data: { nombre, apellido, cedula, correo, passwordHash: hashPassword(password), rol }
  })

  res.status(201).json({ message: 'Usuario creado exitosamente.' })
}

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    select: { id: true, nombre: true, apellido: true, cedula: true, correo: true, rol: true, createdAt: true }
  })
  res.json(users)
}
