import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const dbUser = process.env.DB_USER || process.env.POSTGRES_USER || "postgres";
const dbPassword = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || "postgres";
const dbHost = process.env.DB_HOST || "db";
const dbPort = process.env.DB_PORT || "5432";
const dbName = process.env.DB_NAME || process.env.POSTGRES_DB || "jpeg_db";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;
console.log("DATABASE_URL cargado");

const pool = new pg.Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
