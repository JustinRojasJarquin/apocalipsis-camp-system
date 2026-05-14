import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  ssl: {
    rejectUnauthorized: false,
  },
  connectionLimit: 30,
  acquireTimeout: 10000,
  initializationTimeout: 10000,
});

export const prisma = new PrismaClient({ adapter });

//Se actualizo las consultas, 5 usuarios simultaneamente, con un tiempo de respuesta de 30s, para redes lentas
