# AgroSaaS — Plataforma Agrícola

Plataforma SaaS mobile-first para gestão agrícola completa: clima, preços, financeiro, animais, culturas, marketplace e mais.

## Estrutura do Monorepo

```
agro-saas/
├── apps/
│   ├── web/          # Frontend React + Vite + PWA
│   └── api/          # Backend Express + Prisma
├── packages/
│   └── shared/       # Tipos, schemas e constantes compartilhados
└── docs/             # Documentação
```

## Pré-requisitos

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14 (ou conta no Supabase)

## Início rápido

```bash
# Instalar todas as dependências
npm install

# Rodar frontend e backend juntos
npm run dev

# Rodar separadamente
npm run dev:web   # http://localhost:5173
npm run dev:api   # http://localhost:3333
```

## Configuração do banco

```bash
# Copiar variáveis de ambiente
cp apps/api/.env.example apps/api/.env

# Editar apps/api/.env com sua DATABASE_URL

# Gerar o Prisma Client
npm run db:generate

# Rodar migrações
npm run db:migrate

# Abrir o Prisma Studio
npm run db:studio
```

## Variáveis de Ambiente

Copie `apps/api/.env.example` para `apps/api/.env` e preencha:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL do PostgreSQL (Supabase, local, Render) |
| `JWT_SECRET` | Chave secreta para JWT (mín. 32 chars) |
| `JWT_EXPIRES_IN` | Expiração do token (ex: `7d`) |
| `PORT` | Porta da API (padrão: 3333) |
| `CLIENT_URL` | URL do frontend (para CORS) |

## Deploy

| Serviço | Destino |
|---|---|
| Frontend (`apps/web`) | Vercel ou Netlify |
| Backend (`apps/api`) | Render |
| Banco de dados | Supabase |

## Módulos disponíveis

- **Auth** — Login, registro, JWT
- **Users** — Gestão de usuários
- **Produtores** — Perfil do produtor rural
- **Propriedades** — Fazendas e glebas
- **Animais** — Gestão de rebanho
- **Culturas** — Plantio e colheita
- **Clima** — Consulta meteorológica
- **Precos** — Preços agrícolas em tempo real
- **Financeiro** — Despesas e receitas
- **Notificações** — Alertas e avisos
- **Marketplace** — Compra e venda de produtos
- **Relatórios** — Exportação de dados
- **Admin** — Painel administrativo
- **Plans / Subscriptions** — Planos e assinaturas
