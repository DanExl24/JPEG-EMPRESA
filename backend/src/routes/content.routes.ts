import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import {
  getVocabulary, createVocabularyTerm, updateVocabularyTerm, deleteVocabularyTerm,
  getGlossary, createGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm,
  getDialogues, getDialogueById, createDialogue, updateDialogue, deleteDialogue
} from '../controllers/content.controller.js'
import { authenticate, optionalAuthenticate } from '../lib/middleware.js'

const router = Router()

// Helper middleware to restrict writes to ADMIN/INSTRUCTOR
const requireAdminOrInstructor = (req: Request, res: Response, next: NextFunction): void => {
  const role = String(req.user?.role || '').toUpperCase()
  if (role === 'ADMIN' || role === 'INSTRUCTOR') {
    next()
    return
  }
  res.status(403).json({ message: 'Acceso denegado. Se requiere rol de Administrador o Instructor.' })
}

// --- Vocabulary ---
router.get('/vocabulary', optionalAuthenticate, getVocabulary)
router.post('/vocabulary', authenticate, requireAdminOrInstructor, createVocabularyTerm)
router.put('/vocabulary/:id', authenticate, requireAdminOrInstructor, updateVocabularyTerm)
router.delete('/vocabulary/:id', authenticate, requireAdminOrInstructor, deleteVocabularyTerm)

// --- Glossary (GlosarioView.vue) ---
router.get('/glossary', optionalAuthenticate, getGlossary)
router.post('/glossary', authenticate, requireAdminOrInstructor, createGlossaryTerm)
router.put('/glossary/:id', authenticate, requireAdminOrInstructor, updateGlossaryTerm)
router.delete('/glossary/:id', authenticate, requireAdminOrInstructor, deleteGlossaryTerm)

// --- Dialogues ---
router.get('/dialogues', optionalAuthenticate, getDialogues)
router.get('/dialogues/:id', optionalAuthenticate, getDialogueById)
router.post('/dialogues', authenticate, requireAdminOrInstructor, createDialogue)
router.put('/dialogues/:id', authenticate, requireAdminOrInstructor, updateDialogue)
router.delete('/dialogues/:id', authenticate, requireAdminOrInstructor, deleteDialogue)

export default router
