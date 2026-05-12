import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL || "file:./prisma/db.sqlite";

const adapter = new PrismaBetterSqlite3({ 
  url: connectionString 
});

const prisma = new PrismaClient({ adapter });

export default prisma;
