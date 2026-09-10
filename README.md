# Florae

Plataforma web de cuidados com plantas. Reúne um catálogo pesquisável, orientações de cultivo e informações sobre problemas comuns, com um painel protegido para gerenciar o conteúdo.

## Funcionalidades

- Busca de plantas por nome e filtros por categoria e dificuldade.
- Informações de iluminação, rega, temperatura, umidade e outros cuidados.
- Consulta de problemas comuns, causas e recomendações.
- Gerenciamento de plantas, categorias e problemas.

## Tecnologias

- **Frontend:** React, TypeScript, Vite, Tailwind CSS e React Router.
- **Backend:** Node.js, Express, Prisma e Zod.
- **Banco de dados:** PostgreSQL.
- **Testes:** Node.js Test Runner e Playwright.

## Estrutura

```text
frontend/   Interface, páginas e componentes
backend/    API, autenticação, banco e testes
scripts/    Verificações de produção
```

O projeto utiliza npm workspaces para organizar frontend e backend no mesmo repositório.

## Executar localmente

Requisitos: Node.js 24, npm e Docker Desktop em execução, ou uma instalação própria do PostgreSQL.

Na raiz do projeto:

```sh
npm ci
```

Crie `backend/.env` a partir de `backend/.env.example`, caso ainda não exista, e ajuste a conexão com o banco. Mantenha credenciais fora do repositório.

Com Docker, execute:

```sh
docker compose up -d
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

O Compose inicia o banco; `npm run dev` inicia frontend e backend. Acesse o endereço exibido no terminal, normalmente [http://localhost:5173](http://localhost:5173).

Para carregar conteúdo inicial em um banco novo, use `npm run seed`. Esse comando pode sobrescrever alterações nos registros iniciais quando executado novamente.

Para configurar o acesso ao painel local, execute `npm run admin:setup` e reinicie o backend.

## Verificação

```sh
npm run lint
npm test
npm run build
```

Os testes de navegador são executados com `npm run test:production`. No Windows, utilizam Microsoft Edge; em outros sistemas, instale o Chromium com `npx playwright install chromium`.

Os testes automatizados utilizam dados simulados em parte dos fluxos e não substituem a validação com o banco real.
