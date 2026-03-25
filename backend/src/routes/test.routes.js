import { Router } from 'express'
import { getTest } from '../controllers/test.controller.js'
const router = Router()

// GET /api/test
router.get('/', getTest)

export default router