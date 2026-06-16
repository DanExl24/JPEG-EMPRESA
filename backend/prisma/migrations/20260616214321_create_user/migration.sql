-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "correo" TEXT,
    "password_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'APRENDIZ',
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "training_programs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cohort_number" TEXT NOT NULL,
    "program_id" INTEGER NOT NULL,
    CONSTRAINT "cohorts_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "training_programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "competencies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "program_id" INTEGER NOT NULL,
    CONSTRAINT "competencies_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "training_programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "apprentice_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "enrollments_apprentice_id_fkey" FOREIGN KEY ("apprentice_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "enrollments_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "learning_outcomes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "competency_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "learning_outcomes_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competencies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "assessment_judgment" TEXT NOT NULL DEFAULT 'pending',
    "apprentice_id" INTEGER NOT NULL,
    "learning_outcome_id" INTEGER NOT NULL,
    "updated_by" INTEGER,
    CONSTRAINT "evaluations_apprentice_id_fkey" FOREIGN KEY ("apprentice_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evaluations_learning_outcome_id_fkey" FOREIGN KEY ("learning_outcome_id") REFERENCES "learning_outcomes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "evaluations_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_cedula_key" ON "users"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "users_correo_key" ON "users"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "cohorts_cohort_number_key" ON "cohorts"("cohort_number");

-- CreateIndex
CREATE UNIQUE INDEX "competencies_code_key" ON "competencies"("code");
