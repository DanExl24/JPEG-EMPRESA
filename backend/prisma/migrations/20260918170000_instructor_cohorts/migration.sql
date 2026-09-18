-- Migration: Add InstructorCohorts Many-to-Many join table and unique constraint on enrollments

CREATE TABLE IF NOT EXISTS "_InstructorCohorts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_InstructorCohorts_A_fkey" FOREIGN KEY ("A") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_InstructorCohorts_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "_InstructorCohorts_AB_unique" ON "_InstructorCohorts"("A", "B");
CREATE INDEX IF NOT EXISTS "_InstructorCohorts_B_index" ON "_InstructorCohorts"("B");

-- Ensure unique enrollment per apprentice and cohort if not already present
CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_apprentice_id_cohort_id_key" ON "enrollments"("apprentice_id", "cohort_id");
