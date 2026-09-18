-- Migration: Prevent Staff Points (XP, Game Scores, Badges) in Database
-- Enforces zero points for ADMIN and INSTRUCTOR at the database engine level (Triggers & Constraints).

-- 1. Resetear cualquier XP que tengan usuarios con rol de staff a 0
UPDATE "users" 
SET "xp" = 0 
WHERE "rol" IN ('ADMIN', 'INSTRUCTOR') AND "xp" != 0;

-- 2. Trigger en PostgreSQL para la tabla 'users':
-- Si el rol del usuario es ADMIN o INSTRUCTOR, fuerza irremisiblemente que "xp" sea 0 en INSERT o UPDATE.
CREATE OR REPLACE FUNCTION trg_prevent_staff_xp_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."rol" IN ('ADMIN', 'INSTRUCTOR') THEN
    NEW."xp" := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_staff_xp ON "users";
CREATE TRIGGER trg_prevent_staff_xp
BEFORE INSERT OR UPDATE OF "xp", "rol" ON "users"
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_staff_xp_fn();

-- 3. CHECK CONSTRAINT en la tabla users:
-- Segundo candado físico a nivel de motor de base de datos.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_staff_zero_xp'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT check_staff_zero_xp
    CHECK ("rol" NOT IN ('ADMIN', 'INSTRUCTOR') OR "xp" = 0);
  END IF;
END $$;

-- 4. Trigger en game_scores: puntuaciones de partidas de staff siempre se registran en 0
CREATE OR REPLACE FUNCTION trg_prevent_staff_game_score_fn()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT "rol" INTO user_role FROM "users" WHERE "id" = NEW."user_id";
  IF user_role IN ('ADMIN', 'INSTRUCTOR') THEN
    NEW."score" := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_staff_game_score ON "game_scores";
CREATE TRIGGER trg_prevent_staff_game_score
BEFORE INSERT OR UPDATE ON "game_scores"
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_staff_game_score_fn();

-- 5. Trigger en user_badges: evita otorgar insignias de aprendices a staff
CREATE OR REPLACE FUNCTION trg_prevent_staff_user_badge_fn()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT "rol" INTO user_role FROM "users" WHERE "id" = NEW."user_id";
  IF user_role IN ('ADMIN', 'INSTRUCTOR') THEN
    RETURN NULL; -- Cancela la inserción a nivel motor relacional
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_staff_user_badge ON "user_badges";
CREATE TRIGGER trg_prevent_staff_user_badge
BEFORE INSERT ON "user_badges"
FOR EACH ROW
EXECUTE FUNCTION trg_prevent_staff_user_badge_fn();
