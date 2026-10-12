# Polymarket CCOMP

Mercado de previsões sobre eventos do curso de Ciência da Computação da UFSJ — professores, disciplinas, o prédio e o que mais render aposta.

Trabalho Prático de Engenharia de Software (2026/2).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- PostgreSQL no [Neon](https://neon.tech/) + [Prisma 7](https://www.prisma.io/)
- Vitest + Testing Library

## Como rodar localmente

Pré-requisitos: **Node.js 20.19 ou superior** (recomendado 22, veja `.nvmrc`) e Git.

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

| Comando                 | O que faz                                                    |
| ----------------------- | ------------------------------------------------------------ |
| `npm run dev`           | Sobe o servidor de desenvolvimento                           |
| `npm run build`         | Gera o build de produção                                     |
| `npm run start`         | Roda o build de produção                                     |
| `npm run lint`          | Roda o ESLint (falha com qualquer aviso)                     |
| `npm run lint:fix`      | Corrige automaticamente o que o ESLint consegue              |
| `npm run format`        | Formata todo o projeto com o Prettier                        |
| `npm run format:check`  | Só verifica a formatação, sem alterar                        |
| `npm run typecheck`     | Gera os tipos de rota do Next e checa os tipos do TypeScript |
| `npm run test`          | Roda os testes uma vez (Vitest)                              |
| `npm run test:watch`    | Roda os testes em modo observação                            |
| `npm run test:coverage` | Roda os testes e gera a cobertura em `coverage/`             |
| `npm run db:*`          | Comandos do banco (veja [Banco de dados](#banco-de-dados))   |

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

### Primeira configuração (só uma vez, pelo responsável da infra)

1. Criar o projeto no [Neon](https://console.neon.tech/) (Postgres 17, região mais próxima do Brasil disponível).
2. Em **Connect**, copiar a string **com** "Connection pooling" para `DATABASE_URL` e **sem** para `DIRECT_URL`.
3. Criar a primeira migration e commitar a pasta `prisma/migrations/`:
   ```bash
   npm run db:migrate -- --name init
   ```
4. Repassar o `.env` para o grupo por canal privado.

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

## Análise estática (SonarCloud)

<!-- Depois de configurar o SonarCloud, descomente e troque CHAVE_DO_PROJETO:
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=CHAVE_DO_PROJETO&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=CHAVE_DO_PROJETO)
-->

Depois do CI passar, o job **SonarCloud** envia o código e a cobertura dos testes para o [SonarCloud](https://sonarcloud.io/), que comenta o resultado (bugs, vulnerabilidades, code smells, duplicação e cobertura) em cada Pull Request.

Configuração (uma vez, feita pelo responsável da infra):

1. Entrar em sonarcloud.io com o GitHub e importar o repositório.
2. Em _Administration > Analysis Method_, **desligar** a "Automatic Analysis" (a análise roda pelo GitHub Actions).
3. Copiar `organization` e `projectKey` para o `sonar-project.properties`.
4. Gerar um token em _My Account > Security_ e salvar no GitHub em _Settings > Secrets and variables > Actions_ com o nome `SONAR_TOKEN`.
5. Descomentar o badge acima.

Enquanto o `SONAR_TOKEN` não existir, o job só emite um aviso e não quebra o pipeline.

## Lint, formatação e hooks de commit

- **ESLint** (`eslint.config.mjs`): regras do Next.js + TypeScript. Regras de estilo ficam com o Prettier (`eslint-config-prettier`).
- **Prettier** (`.prettierrc.json`): formatação única para todo mundo, com ordenação automática das classes do Tailwind.
- **Husky** instala os hooks sozinho no `npm install`:
  - `pre-commit` roda o `lint-staged`: ESLint + Prettier **só nos arquivos do commit**. Se o ESLint achar erro ou aviso, o commit é bloqueado.
  - `commit-msg` exige o padrão `PCC-XX: mensagem` (veja [Convenções](#convenções-de-git)).

Dica: no VS Code, instale as extensões **ESLint** e **Prettier** e ative "Format on Save".

## Convenções de Git

Seguimos o **Git Flow** ([referência](https://www.atlassian.com/br/git/tutorials/comparing-workflows/gitflow-workflow)):

| Branch      | Papel                                                                 |
| ----------- | --------------------------------------------------------------------- |
| `main`      | Versões estáveis (entregas de fim de sprint). Ninguém commita direto. |
| `develop`   | Integração do que está pronto. Ninguém commita direto.                |
| `feature/*` | Uma por card do Jira, criada a partir de `develop`                    |
| `bugfix/*`  | Correção de bug, criada a partir de `develop`                         |

**Nome da branch:** `feature/PCC-XX-descricao-curta` ou `bugfix/PCC-XX-descricao-curta`
(ex.: `feature/PCC-1-cadastro-email-institucional`).

**Mensagem de commit:** `PCC-XX: mensagem no imperativo` (ex.: `PCC-1: Valida domínio do e-mail institucional`). O hook `commit-msg` recusa mensagens fora do padrão. Prefira commits pequenos e frequentes.

**Pull Request:** um por card do Jira, para `develop`, preenchendo o template. Precisa de **uma aprovação de um colega** e do **CI verde** para entrar. Use os comentários do PR para sugerir melhorias.

### Fluxo de um card, do início ao merge

```bash
git checkout develop
git pull
git checkout -b feature/PCC-12-fechar-mercado
# ... código + testes ...
git add .
git commit -m "PCC-12: Fecha mercado após a data limite"
git push -u origin feature/PCC-12-fechar-mercado
# abra o PR para develop no GitHub e peça revisão no grupo
```

No Jira: mova o card para **Em Progresso** ao criar a branch, para **Em Validação** ao abrir o PR e para **Concluído** depois do merge.

### Proteção de branches (configuração do repositório)

Em _Settings > Branches > Add branch ruleset_ (ou _Branch protection rules_), para `main` e `develop`:

- [x] Require a pull request before merging — _Required approvals: 1_
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass — marcar **Lint, testes e build** (aparece depois da primeira execução do CI)
- [x] Require branches to be up to date before merging
- [x] Block force pushes

> Em repositório **privado de conta pessoal**, o GitHub só aplica essas regras no plano Pro (gratuito pelo [GitHub Student Developer Pack](https://education.github.com/pack)). No repositório do Classroom, quem configura é quem tem papel de admin no repositório.

### Migração para o repositório do GitHub Classroom

O projeto começou num repositório pessoal. Quando o repositório do Classroom for criado, todo o histórico (commits, autores, datas e branches) vai junto:

```bash
git remote rename origin pessoal
git remote add origin <url-do-repositorio-do-classroom>
git fetch origin

# O Classroom cria o repositório com um commit inicial próprio. Escolha UMA opção:
# (a) substituir esse commit inicial (main ainda sem proteção):
git push --force origin main
# (b) ou preservar o commit do Classroom:
#     git checkout main && git merge origin/main --allow-unrelated-histories && git push origin main

git push origin develop
git push origin --all     # demais branches
git push origin --tags
```

Pull Requests, revisões, execuções do Actions e o vínculo com o SonarCloud **não** são migrados (ficam no GitHub, não no git): abra os PRs, configure os secrets e a proteção de branches já no repositório do Classroom.
