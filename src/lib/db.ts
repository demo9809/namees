import { PrismaClient } from "@prisma/client";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const dbUrl = process.env.DATABASE_URL?.includes("file:") ? `file:${dbPath}` : process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: dbUrl || `file:${dbPath}`,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
