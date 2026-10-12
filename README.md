# Polymarket CCOMP

Mercado de previsões sobre eventos do curso de Ciência da Computação da UFSJ — professores, disciplinas, o prédio e o que mais render aposta.

Trabalho Prático de Engenharia de Software (2026/2).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL no [Neon](https://neon.tech/) + [Prisma 7](https://www.prisma.io/)
- Vitest + Testing Library

## Como rodar localmente

Pré-requisitos: **Node.js 20.9 ou superior** (recomendado 22, veja `.nvmrc`) e Git.

```bash
git clone <url-do-repositorio>
cd polymarket-ccomp
npm install
cp .env.example .env      # no Windows (PowerShell): copy .env.example .env
# preencha DATABASE_URL e DIRECT_URL no .env (veja "Banco de dados")
npm run db:deploy         # aplica as migrations no banco
npm run dev
```

Abra http://localhost:3000. Para conferir se a API está de pé: http://localhost:3000/api/health.

## Estrutura de pastas

```
src/
├── app/            # Telas (App Router): cada pasta é uma rota
│   └── api/        # Route handlers (back-end HTTP)
├── server/         # Services e regras de negócio (só roda no servidor)
│   ├── db.ts       # Cliente do Prisma
│   └── services/
└── generated/      # Prisma Client gerado (fora do git)
prisma/
├── schema.prisma   # Modelo de dados
└── migrations/     # Histórico de migrations (vai para o git)
```

## Scripts

| Comando                | O que faz                                       |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Sobe o servidor de desenvolvimento              |
| `npm run build`        | Gera o build de produção                        |
| `npm run start`        | Roda o build de produção                        |
| `npm run lint`         | Roda o ESLint (falha com qualquer aviso)        |
| `npm run lint:fix`     | Corrige automaticamente o que o ESLint consegue |
| `npm run format`       | Formata todo o projeto com o Prettier           |
| `npm run format:check` | Só verifica a formatação, sem alterar           |

## Banco de dados

PostgreSQL hospedado no **Neon**, acessado pelo **Prisma**.

### Variáveis de ambiente

| Variável       | Para que serve                                                                |
| -------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL` | Conexão **com pooler** (host com `-pooler`). Usada pela aplicação.            |
| `DIRECT_URL`   | Conexão **direta**. Usada só pela CLI do Prisma (migrations e Prisma Studio). |

O pooler é obrigatório em produção: em ambiente serverless cada requisição pode abrir uma conexão nova e, sem ele, o banco esgota o limite de conexões. As migrations, por outro lado, não funcionam através do pooler — por isso as duas URLs.

Peça as credenciais ao responsável pela infraestrutura (Lucas). Não commite o `.env`.

### Modelo de dados

| Tabela         | Conteúdo                                                                       |
| -------------- | ------------------------------------------------------------------------------ |
| `users`        | Conta do participante (e-mail institucional, hash da senha, papel USER/ADMIN)  |
| `wallets`      | Saldo de moedas virtuais, uma por usuário                                      |
| `markets`      | Pergunta, regras, status (OPEN/CLOSED/RESOLVED), estado do LMSR e resultado    |
| `positions`    | Cotas de SIM ou NÃO que cada usuário tem em cada mercado                       |
| `transactions` | Extrato: INITIAL_GRANT, BUY, SELL e PAYOUT, com o saldo resultante de cada uma |

Valores de dinheiro e cotas são `Decimal`, nunca `Float`: o LMSR gera custos fracionários e `Float` acumula erro de arredondamento no saldo.

### Comandos

| Comando                               | O que faz                                                        |
| ------------------------------------- | ---------------------------------------------------------------- |
| `npm run db:migrate -- --name <nome>` | Cria uma migration a partir do `schema.prisma` e aplica no banco |
| `npm run db:deploy`                   | Aplica as migrations pendentes (sem criar novas)                 |
| `npm run db:studio`                   | Abre o Prisma Studio para ver/editar os dados                    |
| `npm run db:generate`                 | Regera o Prisma Client (já roda sozinho no `npm install`)        |

Alterou o `schema.prisma`? Rode `npm run db:migrate -- --name descricao-curta` e commite a pasta gerada em `prisma/migrations/` junto com o schema. Uma migration por PR, para não haver conflito.

## Testes

[Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

- O arquivo de teste fica **ao lado** do código testado, com o sufixo `.test.ts` ou `.test.tsx` (ex.: `page.tsx` → `page.test.tsx`).
- O ambiente padrão é `jsdom` (simula o navegador). Para testar services e rotas da API, coloque `// @vitest-environment node` na primeira linha do arquivo.
- `describe`, `it` e `expect` são globais; os matchers do `jest-dom` (`toBeInTheDocument` etc.) já vêm carregados em `vitest.setup.ts`.
- Exemplos: `src/app/page.test.tsx` (componente) e `src/app/api/health/route.test.ts` (rota da API).

## Integração contínua (GitHub Actions)

O workflow `.github/workflows/ci.yml` roda em todo Pull Request para `develop` ou `main` (e em todo push nelas):

1. `npm ci`
2. `npm run lint`
3. `npm run format:check`
4. `npm run typecheck`
5. `npm run test:coverage`
6. `npm run build`

Se qualquer passo falhar, o check **Lint, testes e build** fica vermelho e a proteção de branch impede o merge. Antes de abrir o PR, rode o mesmo localmente:

```bash
npm run lint && npm run format:check && npm run typecheck && npm run test && npm run build
```

## Lint, formatação e hooks de commit

- **ESLint** (`eslint.config.mjs`): regras do Next.js + TypeScript. Regras de estilo ficam com o Prettier (`eslint-config-prettier`).
- **Prettier** (`.prettierrc.json`): formatação única para todo mundo, com ordenação automática das classes do Tailwind.
- **Husky** instala os hooks sozinho no `npm install`:
  - `pre-commit` roda o `lint-staged`: ESLint + Prettier **só nos arquivos do commit**. Se o ESLint achar erro ou aviso, o commit é bloqueado.
  - `commit-msg` exige o padrão `PCC-XX: mensagem` (veja [Convenções](#convenções-de-git)).

Dica: no VS Code, instale as extensões **ESLint** e **Prettier** e ative "Format on Save".
