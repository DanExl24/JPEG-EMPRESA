import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import {
  getVocabulary, createVocabularyTerm, updateVocabularyTerm, deleteVocabularyTerm,
  getDialogues, getDialogueById, createDialogue, updateDialogue, deleteDialogue
} from '../controllers/content.controller.js'
import { authenticate } from '../lib/middleware.js'

const router = Router()

router.use(authenticate)

// Helper middleware to restrict writes to ADMIN/INSTRUCTOR
const requireAdminOrInstructor = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role === 'ADMIN' || req.user?.role === 'INSTRUCTOR') {
    next()
    return
  }
  res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador o Instructor.' })
}

// --- Vocabulary ---
router.get('/vocabulary', getVocabulary)
router.post('/vocabulary', requireAdminOrInstructor, createVocabularyTerm)
router.put('/vocabulary/:id', requireAdminOrInstructor, updateVocabularyTerm)
router.delete('/vocabulary/:id', requireAdminOrInstructor, deleteVocabularyTerm)

// --- Dialogues ---
router.get('/dialogues', getDialogues)
router.get('/dialogues/:id', getDialogueById)
router.post('/dialogues', requireAdminOrInstructor, createDialogue)
router.put('/dialogues/:id', requireAdminOrInstructor, updateDialogue)
router.delete('/dialogues/:id', requireAdminOrInstructor, deleteDialogue)

export default router
