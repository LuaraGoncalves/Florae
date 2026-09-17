# Florae

Catálogo de plantas e diário de cuidados para acompanhar o cultivo no dia a dia.

O Florae reúne orientações por espécie, busca por categoria e dificuldade, favoritos e uma coleção pessoal com histórico de cuidados. O conteúdo do catálogo é gerenciado em um painel administrativo autenticado.

## Recursos

- **Catálogo:** busca, filtros e páginas com orientações de cultivo.
- **Cuidados:** informações sobre rega, iluminação, substrato e problemas comuns.
- **Coleção pessoal:** favoritos, identificação das plantas e registros de rega, adubação e poda.
- **Administração:** cadastro de plantas, categorias e problemas, com upload de fotos.

Favoritos e coleção são armazenados no navegador, sem sincronização entre dispositivos. A exclusão dos dados do navegador remove esses registros.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Interface | React, TypeScript, Vite, Tailwind CSS e React Router |
| API | Node.js, Express, Prisma e Zod |
| Persistência | PostgreSQL |
| Imagens | Cloudinary |
| Qualidade | ESLint, Node.js Test Runner e Playwright |

## Organização

Monorepositório com npm workspaces:

```text
frontend/   Interface e estado local
backend/    API, autenticação, migrações e testes
scripts/    Testes de integração no navegador
docs/       Documentação técnica
```

## Desenvolvimento

**Requisitos:** Node.js 24, npm e PostgreSQL. O banco local pode ser iniciado com Docker Compose.

1. Instale as dependências com `npm ci`.
2. Crie `backend/.env` com base em [backend/.env.example](backend/.env.example), preservando configurações existentes.
3. Inicie o banco e a aplicação:

```sh
docker compose up -d
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

O frontend fica disponível, por padrão, em [localhost:5173](http://localhost:5173), e a API em `localhost:3333/api`. O Compose executa somente o PostgreSQL.

| Comando | Finalidade |
| --- | --- |
| `npm run admin:setup` | Configurar o administrador local; requer reiniciar o backend |
| `npm run seed` | Carregar conteúdo inicial; pode sobrescrever os registros correspondentes |
| `npm run build` | Compilar frontend e backend |
| `npm run lint` | Analisar o código do frontend |
| `npm test` | Executar testes do backend |
| `npm run test:production` | Executar verificações no navegador com build de produção |

Os testes de navegador utilizam Microsoft Edge no Windows. Nos demais sistemas, instale o Chromium com `npx playwright install chromium`. Os fluxos com dados simulados não validam a persistência no banco real.

## Documentação

- [Upload e armazenamento de fotos](docs/photos.md)
- [Variáveis do backend](backend/.env.example)
- [Variáveis do frontend](frontend/.env.example)

Arquivos `.env` com credenciais não devem ser versionados.
