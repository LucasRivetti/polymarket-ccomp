// @vitest-environment node
import { createPrismaClient, db } from "./db";

describe("createPrismaClient", () => {
  it("falha com mensagem clara quando não há string de conexão", () => {
    expect(() => createPrismaClient("")).toThrow(/DATABASE_URL não definida/);
  });

  it("cria o cliente sem conectar ao banco (a conexão só abre na primeira query)", () => {
    const client = createPrismaClient("postgresql://teste:teste@localhost:5432/teste");
    expect(client.$connect).toBeTypeOf("function");
  });
});

describe("db", () => {
  it("pode ser importado sem DATABASE_URL; o erro só aparece no primeiro uso", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(() => db.user).toThrow(/DATABASE_URL não definida/);
    vi.unstubAllEnvs();
  });
});
