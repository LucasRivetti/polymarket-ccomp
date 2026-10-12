import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuração da CLI do Prisma (migrate, studio, generate).
// A CLI usa a conexão DIRETA (sem pooler): migrations não funcionam através do PgBouncer.
// A aplicação em si usa DATABASE_URL (com pooler) — veja src/server/db.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Opcional para `prisma generate` (roda no npm install); obrigatório para migrate/studio
    url: process.env.DIRECT_URL,
  },
});
