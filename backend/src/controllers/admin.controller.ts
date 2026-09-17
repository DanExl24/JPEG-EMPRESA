import type { Request, Response, NextFunction } from 'express'
import { AdminService } from '../services/admin.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { BadRequestError } from '../utils/appError.js'

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.query.role as string | undefined
    const search = req.query.search as string | undefined
    const users = await AdminService.listUsers(role, search)
    ApiResponse.success(res, users)
  } catch (error) {
    next(error)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await AdminService.createUser(req.body)
    ApiResponse.created(res, user, 'Usuario creado exitosamente.')
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID de usuario inválido.')

    const updated = await AdminService.updateUser(id, req.body)
    ApiResponse.success(res, updated, 'Usuario actualizado exitosamente.')
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID de usuario inválido.')

    await AdminService.deleteUser(id)
    ApiResponse.success(res, { id }, 'Usuario y registros asociados eliminados exitosamente.')
  } catch (error) {
    next(error)
  }
}

export async function getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.user?.id)
    const preferences = await AdminService.getPreferences(userId)
    ApiResponse.success(res, preferences)
  } catch (error) {
    next(error)
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.user?.id)
    const updated = await AdminService.updatePreferences(userId, req.body)
    ApiResponse.success(res, updated, 'Preferencias actualizadas exitosamente.')
  } catch (error) {
    next(error)
  }
}
