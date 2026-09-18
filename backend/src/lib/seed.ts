import prisma from './db.js'
import {
  ensureDefaultAuthUser,
  ensureDefaultInstructorUser,
  ensureDefaultApprenticeUser,
  ensureDefaultCurriculum,
  ensureDefaultCourses,
  ensureDefaultActivities,
  cleanupLegacySeedActivities,
  ensureDefaultVocabulary,
  ensureDefaultDialogues,
  ensureDefaultGlossary,
  ensureDefaultArcadeGames,
  ensureStaffPointsValidator,
} from './bootstrapAuth.js'
import { CourseService } from '../services/course.service.js'
import { GamificationService } from '../services/gamification.service.js'
import { seedVolume } from './seedVolume.js'

/** Siembra el catálogo base (idempotente) reutilizando bootstrapAuth. */
async function seedCatalog(): Promise<void> {
  await ensureDefaultAuthUser()
  await ensureDefaultInstructorUser()
  await ensureDefaultApprenticeUser()
  await ensureDefaultCurriculum()
  await ensureDefaultCourses()
  await ensureDefaultActivities()
  await cleanupLegacySeedActivities()
  await CourseService.syncActivityCourseIds()
  await ensureDefaultVocabulary()
  await ensureDefaultDialogues()
  await ensureDefaultGlossary()
  await ensureDefaultArcadeGames()
  await GamificationService.ensureBadges()
  await ensureStaffPointsValidator()
  console.log('✓ Catálogo base asegurado (usuarios, currículum con 6 RAPs, cursos clínicos oficiales, actividades, glosario, insignias y validador de puntos).')
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
