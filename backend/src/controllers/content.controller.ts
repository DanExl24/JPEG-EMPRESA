import type { Request, Response, NextFunction } from 'express'
import { ContentService } from '../services/content.service.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { BadRequestError } from '../utils/appError.js'

// --- VOCABULARY ---
export async function getVocabulary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = req.query.category as string | undefined
    const search = req.query.search as string | undefined
    const list = await ContentService.getVocabulary(category, search)
    res.json(list)
  } catch (err) {
    next(err)
  }
}

export async function createVocabularyTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const created = await ContentService.createVocabulary(req.body)
    ApiResponse.created(res, created, 'Término de vocabulario creado.')
  } catch (err) {
    next(err)
  }
}

export async function updateVocabularyTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    const updated = await ContentService.updateVocabulary(id, req.body)
    ApiResponse.success(res, updated, 'Término de vocabulario actualizado.')
  } catch (err) {
    next(err)
  }
}

export async function deleteVocabularyTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    await ContentService.deleteVocabulary(id)
    ApiResponse.success(res, { id }, 'Término de vocabulario eliminado correctamente.')
  } catch (err) {
    next(err)
  }
}

// --- GLOSSARY (GlosarioView.vue) ---
export async function getGlossary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const letter = req.query.letter as string | undefined
    const search = req.query.search as string | undefined
    const list = await ContentService.getGlossary(letter, search)
    res.json(list)
  } catch (err) {
    next(err)
  }
}

export async function createGlossaryTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const created = await ContentService.createGlossaryTerm(req.body)
    ApiResponse.created(res, created, 'Concepto de glosario creado.')
  } catch (err) {
    next(err)
  }
}

export async function updateGlossaryTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    const updated = await ContentService.updateGlossaryTerm(id, req.body)
    ApiResponse.success(res, updated, 'Concepto de glosario actualizado.')
  } catch (err) {
    next(err)
  }
}

export async function deleteGlossaryTerm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    await ContentService.deleteGlossaryTerm(id)
    ApiResponse.success(res, { id }, 'Concepto de glosario eliminado correctamente.')
  } catch (err) {
    next(err)
  }
}

// --- DIALOGUES ---
export async function getDialogues(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await ContentService.getDialogues()
    res.json(list)
  } catch (err) {
    next(err)
  }
}

export async function getDialogueById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    const item = await ContentService.getDialogueById(id)
    res.json(item)
  } catch (err) {
    next(err)
  }
}

export async function createDialogue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const created = await ContentService.createDialogue(req.body)
    ApiResponse.created(res, created, 'Diálogo creado exitosamente.')
  } catch (err) {
    next(err)
  }
}

export async function updateDialogue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    const updated = await ContentService.updateDialogue(id, req.body)
    ApiResponse.success(res, updated, 'Diálogo actualizado exitosamente.')
  } catch (err) {
    next(err)
  }
}

export async function deleteDialogue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new BadRequestError('ID inválido.')
    await ContentService.deleteDialogue(id)
    ApiResponse.success(res, { id }, 'Diálogo eliminado correctamente.')
  } catch (err) {
    next(err)
  }
}
