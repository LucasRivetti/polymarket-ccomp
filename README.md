# Polymarket CCOMP

Mercado de previsões sobre eventos do curso de Ciência da Computação da UFSJ — professores, disciplinas, o prédio e o que mais render aposta.

Trabalho Prático de Engenharia de Software (2026/2).

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- Tailwind CSS 4

## Como rodar localmente

Pré-requisitos: **Node.js 20.9 ou superior** (recomendado 22, veja `.nvmrc`) e Git.

```bash
git clone <url-do-repositorio>
cd polymarket-ccomp
npm install
npm run dev
```

Abra http://localhost:3000. Para conferir se a API está de pé: http://localhost:3000/api/health.

## Estrutura de pastas

```
src/
├── app/            # Telas (App Router): cada pasta é uma rota
│   └── api/        # Route handlers (back-end HTTP)
└── server/         # Services e regras de negócio (só roda no servidor)
    └── services/
```

## Scripts

| Comando         | O que faz                         |
| --------------- | --------------------------------- |
| `npm run dev`   | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção          |
| `npm run start` | Roda o build de produção          |
| `npm run lint`  | Roda o ESLint                     |
