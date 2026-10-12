# src/server

Camada de serviços e regras de negócio. Nada aqui é enviado ao navegador.

- `services/` — um arquivo por domínio (ex.: `market.service.ts`, `wallet.service.ts`).
  Os route handlers em `src/app/api` só validam a entrada e chamam um service.
- `db.ts` — cliente do Prisma compartilhado. Importe com `import { db } from "@/server/db"`.

Regra de dependência: `src/app` → `src/server` → banco. Nunca o contrário.
