import type { Request, Response } from 'express'
import prisma from '../lib/db.js'
import { hashPassword } from '../lib/password.js'

function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[@#$%&*]/.test(password)
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const { nombre, apellido, cedula, correo, password, rol } = req.body || {}
    if (!nombre || !apellido || !cedula || !correo || !password || !rol) {
      res.status(400).json({ message: 'Todos los campos son obligatorios.' })
      return
    }
    
    if (!['ADMIN', 'INSTRUCTOR'].includes(rol)) {
      res.status(400).json({ message: 'Rol inválido para este endpoint.' })
      return
    }

    if (!isValidPassword(password)) {
      res.status(400).json({ message: 'La contraseña no cumple los requisitos.' })
      return
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ correo }, { cedula }] }
    })

    if (existing) {
      res.status(400).json({ message: 'El usuario ya existe (correo o cédula duplicada).' })
      return
    }

    await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cedula: cedula.trim(),
        correo: correo.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        rol
      }
    })

    res.status(201).json({ message: 'Usuario creado exitosamente.' })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ message: 'Error interno al crear usuario.' })
  }
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, nombre: true, apellido: true, cedula: true, correo: true, rol: true, createdAt: true }
    })
    res.json(users)
  } catch (error) {
    console.error('Error listing users:', error)
    res.status(500).json({ message: 'Error interno al listar usuarios.' })
  }
}
