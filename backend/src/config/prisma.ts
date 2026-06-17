import dotenv from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

dotenv.config({ override: true });

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  ssl: { rejectUnauthorized: false },
  allowPublicKeyRetrieval: true,
  connectionLimit: 50,
  acquireTimeout: 30000,
  initializationTimeout: 30000,
});

export const prisma = new PrismaClient({ adapter });

