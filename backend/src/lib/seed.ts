import prisma from './db.js'
import {
  ensureDefaultAuthUser,
  ensureDefaultInstructorUser,
  ensureDefaultApprenticeUser,
  ensureDefaultActivities,
  ensureDefaultCurriculum,
  ensureDefaultVocabulary,
  ensureDefaultDialogues,
  ensureDefaultCourses,
  ensureDefaultGlossary,
} from './bootstrapAuth.js'
import { GamificationService } from '../services/gamification.service.js'
import { seedVolume } from './seedVolume.js'

/** Siembra el catálogo base (idempotente) reutilizando bootstrapAuth. */
async function seedCatalog(): Promise<void> {
  await ensureDefaultAuthUser()
  await ensureDefaultInstructorUser()
  await ensureDefaultApprenticeUser()
  await ensureDefaultActivities()
  await ensureDefaultCurriculum()
  await ensureDefaultVocabulary()
  await ensureDefaultDialogues()
  await ensureDefaultCourses()
  await ensureDefaultGlossary()
  await GamificationService.ensureBadges()
  console.log('✓ Catálogo base asegurado (usuarios, cursos, actividades, vocabulario, glosario, insignias).')
}

async function main(): Promise<void> {
  console.log('🌱 Iniciando seeder...')
  await seedCatalog()
  await seedVolume()
  console.log('🌱 Seeder finalizado.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('Error en el seeder:', error)
    await prisma.$disconnect()
    process.exit(1)
  })
