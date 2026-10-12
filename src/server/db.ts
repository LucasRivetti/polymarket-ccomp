import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

export function createPrismaClient(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida. Copie .env.example para .env e preencha.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/**
 * Em desenvolvimento, o hot reload do Next recarrega os módulos a cada alteração;
 * guardar a instância em `globalThis` evita abrir uma conexão nova a cada reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient(): PrismaClient {
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

/**
 * Cliente do Prisma compartilhado pela aplicação: `import { db } from "@/server/db"`.
 *
 * É criado só no primeiro uso (não na importação), então importar este arquivo
 * não quebra o build nem os testes em ambientes sem DATABASE_URL.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
