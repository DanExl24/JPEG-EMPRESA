import prisma from '../lib/db.js'
import { hashPassword } from '../lib/password.js'
import { NotFoundError, BadRequestError, ConflictError } from '../utils/appError.js'
import type { CreateUserAdminDto, UpdateUserAdminDto } from '../types/admin.types.js'

function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8 && /[A-Z]/.test(password) && /[@#$%&*!._-]/.test(password)
}

export class AdminService {
  /**
   * Lista todos los usuarios de la base de datos con conteo de cursos y entregas
   */
  static async listUsers(role?: string, search?: string) {
    const where: Record<string, unknown> = {}

    if (role) {
      where.rol = role.toUpperCase()
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { correo: { contains: search, mode: 'insensitive' } },
        { cedula: { contains: search } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cedula: true,
        correo: true,
        rol: true,
        xp: true,
        createdAt: true,
        enrollments: {
          include: {
            cohort: {
              include: {
                program: { select: { id: true, name: true } }
              }
            }
          }
        },
        instructedCohorts: {
          include: {
            program: { select: { id: true, name: true } }
          }
        },
        _count: {
          select: {
            evaluationsAsApprentice: true,
            courseProgresses: true
          }
        }
      },
      orderBy: { id: 'asc' }
    })

    const roleColors: Record<string, { bg: string; text: string; avatarBg: string; avatarColor: string }> = {
      ADMIN: { bg: 'bg-red-100', text: 'text-red-700', avatarBg: 'bg-red-50', avatarColor: '#ef4444' },
      INSTRUCTOR: { bg: 'bg-blue-100', text: 'text-blue-700', avatarBg: 'bg-blue-50', avatarColor: '#3b82f6' },
      APRENDIZ: { bg: 'bg-green-100', text: 'text-green-700', avatarBg: 'bg-green-50', avatarColor: '#10b981' }
    }

    return users.map((u: any) => {
      const initials = `${u.nombre[0] || ''}${u.apellido[0] || ''}`.toUpperCase()
      const roleKey = u.rol.toUpperCase()
      const colors = roleColors[roleKey] || roleColors.APRENDIZ

      // Cohorte para Aprendiz (matriculado)
      const activeEnrollment = u.enrollments?.[0] || null
      const cohortId = activeEnrollment?.cohort_id || null
      const cohortNumber = activeEnrollment?.cohort?.cohort_number || null
      const programName = activeEnrollment?.cohort?.program?.name || null

      // Cohortes para Instructor (fichas que imparte)
      const instructedCohorts = (u.instructedCohorts || []).map((c: any) => ({
        id: c.id,
        cohort_number: c.cohort_number,
        program_id: c.program_id,
        programName: c.program?.name || null
      }))
      const cohortIds = instructedCohorts.map((c: any) => c.id)

      return {
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        name: `${u.nombre} ${u.apellido}`,
        email: u.correo || 'Sin correo',
        cedula: u.cedula,
        initials,
        role: u.rol.toLowerCase(),
        roleLabel: u.rol === 'ADMIN' ? 'Admin' : u.rol === 'INSTRUCTOR' ? 'Instructor' : 'Aprendiz',
        roleBg: colors.bg,
        roleText: colors.text,
        courses: u._count.courseProgresses || 0,
        active: true,
        lastAccess: 'Reciente',
        avatarBg: colors.avatarBg,
        avatarColor: colors.avatarColor,
        xp: u.xp,
        createdAt: u.createdAt,
        // Datos de ficha/cohorte
        cohortId,
        cohortNumber,
        programName,
        instructedCohorts,
        cohortIds,
        cohortCount: instructedCohorts.length
      }
    })
  }

  /**
   * Crea un nuevo usuario desde el panel de administración
   */
  static async createUser(data: CreateUserAdminDto) {
    const { nombre, apellido, cedula, correo, password, rol, cohortId, cohortIds } = data
    if (!nombre || !apellido || !cedula || !correo || !password || !rol) {
      throw new BadRequestError('Todos los campos son obligatorios.')
    }

    const normalizedRole = rol.toUpperCase()
    if (!['ADMIN', 'INSTRUCTOR', 'APRENDIZ'].includes(normalizedRole)) {
      throw new BadRequestError('Rol inválido. Opciones permitidas: ADMIN, INSTRUCTOR, APRENDIZ.')
    }

    if (!isValidPassword(password)) {
      throw new BadRequestError('La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un carácter especial (@#$%&*!._-).')
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ correo: correo.trim().toLowerCase() }, { cedula: cedula.trim() }]
      }
    })

    if (existing) {
      throw new ConflictError('El usuario ya existe (correo o documento de identidad duplicado).')
    }

    const newUser = await prisma.user.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        cedula: cedula.trim(),
        correo: correo.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        rol: normalizedRole
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cedula: true,
        correo: true,
        rol: true,
        createdAt: true
      }
    })

    // Si es Aprendiz y se asigna una ficha, matricularlo
    if (normalizedRole === 'APRENDIZ' && cohortId) {
      await prisma.enrollment.create({
        data: {
          apprentice_id: newUser.id,
          cohort_id: Number(cohortId),
          status: 'active'
        }
      })
    } else if (normalizedRole === 'INSTRUCTOR' && Array.isArray(cohortIds) && cohortIds.length > 0) {
      // Si es Instructor y se asignan fichas, vincularlas
      await prisma.user.update({
        where: { id: newUser.id },
        data: {
          instructedCohorts: {
            connect: cohortIds.map((cid: number | string) => ({ id: Number(cid) }))
          }
        }
      })
    }

    return newUser
  }

  /**
   * Actualiza los datos de un usuario
   */
  static async updateUser(id: number, data: UpdateUserAdminDto) {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Usuario #${id} no encontrado.`)

    if (data.correo && data.correo.trim().toLowerCase() !== existing.correo?.toLowerCase()) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          correo: data.correo.trim().toLowerCase(),
          NOT: { id }
        }
      })
      if (emailConflict) {
        throw new ConflictError('Ya existe otro usuario registrado con ese correo electrónico.')
      }
    }

    if (data.password) {
      if (!isValidPassword(data.password)) {
        throw new BadRequestError('La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula y un carácter especial (@#$%&*!._-).')
      }
    }

    const targetRole = data.rol ? data.rol.toUpperCase() : existing.rol.toUpperCase()

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.nombre ? { nombre: data.nombre.trim() } : {}),
        ...(data.apellido ? { apellido: data.apellido.trim() } : {}),
        ...(data.correo ? { correo: data.correo.trim().toLowerCase() } : {}),
        ...(data.rol ? { rol: data.rol.toUpperCase() } : {}),
        ...(data.password ? { passwordHash: hashPassword(data.password) } : {})
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        cedula: true,
        correo: true,
        rol: true
      }
    })

    // Sincronizar Ficha para Aprendiz
    if (targetRole === 'APRENDIZ' && data.cohortId !== undefined) {
      await prisma.enrollment.deleteMany({ where: { apprentice_id: id } })
      if (data.cohortId) {
        await prisma.enrollment.create({
          data: {
            apprentice_id: id,
            cohort_id: Number(data.cohortId),
            status: 'active'
          }
        })
      }
    }

    // Sincronizar Fichas para Instructor
    if (targetRole === 'INSTRUCTOR' && data.cohortIds !== undefined) {
      await prisma.user.update({
        where: { id },
        data: {
          instructedCohorts: {
            set: Array.isArray(data.cohortIds) ? data.cohortIds.map((cid: number | string) => ({ id: Number(cid) })) : []
          }
        }
      })
    }

    return updated
  }

  /**
   * Elimina un usuario y sus registros relacionados en cascada
   */
  static async deleteUser(id: number) {
    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Usuario #${id} no encontrado.`)

    await prisma.enrollment.deleteMany({ where: { apprentice_id: id } })
    await prisma.activitySubmission.deleteMany({ where: { apprenticeId: id } })
    await prisma.evaluation.deleteMany({ where: { apprentice_id: id } })
    await prisma.userBadge.deleteMany({ where: { userId: id } })
    await prisma.courseProgress.deleteMany({ where: { userId: id } })
    await prisma.gameScore.deleteMany({ where: { userId: id } })
    await prisma.auditLog.deleteMany({ where: { userId: id } })

    return await prisma.user.delete({ where: { id } })
  }

  /**
   * Obtiene preferencias de usuario (SettingsView.vue)
   */
  static async getPreferences(userId: number) {
    let pref = await prisma.userPreference.findUnique({ where: { userId } })
    if (!pref) {
      pref = await prisma.userPreference.create({
        data: { userId }
      })
    }
    return pref
  }

  /**
   * Actualiza preferencias de usuario (SettingsView.vue)
   */
  static async updatePreferences(
    userId: number,
    data: {
      emailNotifications?: boolean
      activityAlerts?: boolean
      rankingAlerts?: boolean
      theme?: string
      language?: string
    }
  ) {
    const updateData: Record<string, unknown> = {}

    if (typeof data.emailNotifications === 'boolean') {
      updateData.emailNotifications = data.emailNotifications
    }
    if (typeof data.activityAlerts === 'boolean') {
      updateData.activityAlerts = data.activityAlerts
    }
    if (typeof data.rankingAlerts === 'boolean') {
      updateData.rankingAlerts = data.rankingAlerts
    }
    if (typeof data.language === 'string') {
      const normalizedLang = data.language.toLowerCase().trim()
      if (['es', 'en', 'pt'].includes(normalizedLang)) {
        updateData.language = normalizedLang
      }
    }

    return await prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...updateData
      },
      update: {
        ...updateData
      }
    })
  }
}
