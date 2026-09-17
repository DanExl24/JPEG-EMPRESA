import prisma from '../lib/db.js'
import { NotFoundError, BadRequestError } from '../utils/appError.js'
import type {
  CreateVocabularyDto,
  UpdateVocabularyDto,
  CreateGlossaryDto,
  UpdateGlossaryDto,
  CreateDialogueDto,
  UpdateDialogueDto
} from '../types/content.types.js'

export class ContentService {
  // ==========================================
  // VOCABULARIO
  // ==========================================
  static async getVocabulary(category?: string, search?: string) {
    const where: Record<string, unknown> = {}

    if (category && category !== 'Todos') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { wordEn: { contains: search, mode: 'insensitive' } },
        { wordEs: { contains: search, mode: 'insensitive' } },
        { definition: { contains: search, mode: 'insensitive' } }
      ]
    }

    return await prisma.vocabulary.findMany({
      where,
      orderBy: { wordEn: 'asc' }
    })
  }

  static async createVocabulary(data: CreateVocabularyDto) {
    if (!data.wordEn || !data.wordEs || !data.category || !data.definition) {
      throw new BadRequestError('wordEn, wordEs, category y definition son campos obligatorios.')
    }

    return await prisma.vocabulary.create({
      data: {
        wordEn: data.wordEn.trim(),
        wordEs: data.wordEs.trim(),
        category: data.category.trim(),
        definition: data.definition.trim(),
        example: data.example?.trim() || null
      }
    })
  }

  static async updateVocabulary(id: number, data: UpdateVocabularyDto) {
    const existing = await prisma.vocabulary.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Término de vocabulario #${id} no encontrado.`)

    return await prisma.vocabulary.update({
      where: { id },
      data: {
        ...(data.wordEn ? { wordEn: data.wordEn.trim() } : {}),
        ...(data.wordEs ? { wordEs: data.wordEs.trim() } : {}),
        ...(data.category ? { category: data.category.trim() } : {}),
        ...(data.definition ? { definition: data.definition.trim() } : {}),
        ...(data.example !== undefined ? { example: data.example?.trim() || null } : {})
      }
    })
  }

  static async deleteVocabulary(id: number) {
    const existing = await prisma.vocabulary.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Término de vocabulario #${id} no encontrado.`)

    return await prisma.vocabulary.delete({ where: { id } })
  }

  // ==========================================
  // GLOSARIO CLÍNICO (GlosarioView.vue)
  // ==========================================
  static async getGlossary(letter?: string, search?: string) {
    const where: Record<string, unknown> = {}

    if (letter) {
      where.term = { startsWith: letter, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { term: { contains: search, mode: 'insensitive' } },
        { definition: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } }
      ]
    }

    const list = await prisma.glossaryTerm.findMany({
      where,
      orderBy: { term: 'asc' }
    })

    return list.map((item: any) => {
      let relatedArray: string[] = []
      try {
        relatedArray = JSON.parse(item.related)
      } catch {
        relatedArray = []
      }
      return {
        ...item,
        related: relatedArray
      }
    })
  }

  static async createGlossaryTerm(data: CreateGlossaryDto) {
    if (!data.term || !data.area || !data.definition) {
      throw new BadRequestError('Término, área y definición son requeridos.')
    }

    const relatedStr = Array.isArray(data.related)
      ? JSON.stringify(data.related)
      : typeof data.related === 'string'
        ? data.related
        : '[]'

    return await prisma.glossaryTerm.create({
      data: {
        term: data.term.trim(),
        area: data.area.trim(),
        definition: data.definition.trim(),
        related: relatedStr,
        example: data.example?.trim() || null
      }
    })
  }

  static async updateGlossaryTerm(id: number, data: UpdateGlossaryDto) {
    const existing = await prisma.glossaryTerm.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Concepto de glosario #${id} no encontrado.`)

    const relatedStr = data.related !== undefined
      ? (Array.isArray(data.related) ? JSON.stringify(data.related) : String(data.related))
      : undefined

    return await prisma.glossaryTerm.update({
      where: { id },
      data: {
        ...(data.term ? { term: data.term.trim() } : {}),
        ...(data.area ? { area: data.area.trim() } : {}),
        ...(data.definition ? { definition: data.definition.trim() } : {}),
        ...(relatedStr !== undefined ? { related: relatedStr } : {}),
        ...(data.example !== undefined ? { example: data.example?.trim() || null } : {})
      }
    })
  }

  static async deleteGlossaryTerm(id: number) {
    const existing = await prisma.glossaryTerm.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError(`Concepto de glosario #${id} no encontrado.`)

    return await prisma.glossaryTerm.delete({ where: { id } })
  }

  // ==========================================
  // DIÁLOGOS CLÍNICOS (DialogosView.vue)
  // ==========================================
  static async getDialogues() {
    return await prisma.dialogue.findMany({
      orderBy: { id: 'asc' }
    })
  }

  static async getDialogueById(id: number) {
    const d = await prisma.dialogue.findUnique({ where: { id } })
    if (!d) throw new NotFoundError(`Diálogo #${id} no encontrado.`)
    return d
  }

  static async createDialogue(data: CreateDialogueDto) {
    if (!data.title || !data.content) {
      throw new BadRequestError('Título y contenido del diálogo son obligatorios.')
    }

    return await prisma.dialogue.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() || null,
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content)
      }
    })
  }

  static async updateDialogue(id: number, data: UpdateDialogueDto) {
    await this.getDialogueById(id)

    return await prisma.dialogue.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.content !== undefined ? { content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content) } : {})
      }
    })
  }

  static async deleteDialogue(id: number) {
    await this.getDialogueById(id)
    return await prisma.dialogue.delete({ where: { id } })
  }
}
