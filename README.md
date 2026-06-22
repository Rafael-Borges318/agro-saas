# Agro Controle — Plataforma SaaS de Gestão Agrícola

> MVP de portfólio — plataforma completa para produtores rurais gerenciarem clima, finanças, rebanho, preços de mercado e marketplace, construída como monorepo full-stack com React + Express + PostgreSQL.

---

## Visão Geral

O **Agro Controle** nasceu como um projeto de portfólio que simula um produto real de mercado voltado ao agronegócio brasileiro. A ideia é centralizar em um único painel tudo que um produtor rural precisa acompanhar no dia a dia: o tempo, os preços das commodities, as finanças da fazenda, o rebanho e um marketplace para compra e venda de insumos.

O projeto cobre autenticação, onboarding guiado, múltiplos módulos de domínio, exportação de PDF, um crawler de dados externos e uma arquitetura de monorepo escalável — tornando-o um exemplo completo de aplicação SaaS do mundo real.

---

## Arquitetura

```
agro/                          ← raiz do monorepo (npm workspaces)
├── apps/
│   ├── api/                   ← backend Node.js/Express + TypeScript
│   │   ├── src/
│   │   │   ├── modules/       ← 18 módulos (auth, animais, financeiro…)
│   │   │   ├── middlewares/   ← auth JWT, rate-limit, error handler
│   │   │   ├── jobs/          ← cron jobs (clima, preços, crawler…)
│   │   │   ├── config/        ← db, cors, env
│   │   │   └── routes/        ← roteador central /api/v1
│   │   └── prisma/            ← schema.prisma + migrations
│   └── web/                   ← frontend React 18 + Vite + PWA
│       ├── src/
│       │   ├── pages/         ← 8 páginas principais
│       │   ├── components/    ← componentes reutilizáveis + layout
│       │   ├── store/         ← estado global com Zustand
│       │   ├── services/      ← camada de chamadas HTTP (axios)
│       │   └── routes/        ← roteamento React Router v6
│       └── public/
└── packages/
    └── shared/                ← tipos TypeScript e schemas Zod compartilhados
```

### Stack técnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 · Vite · TypeScript · Tailwind CSS · Zustand · React Router v6 · jsPDF · PWA |
| Backend | Node.js · Express · TypeScript · Prisma ORM · Zod · JWT · bcryptjs · Winston · node-cron |
| Banco de dados | PostgreSQL (hospedado no Supabase) |
| Autenticação | JWT via Bearer Token — `authenticate` middleware em rotas privadas |
| Monorepo | npm workspaces |

---

## Módulos da API (`/api/v1`)

| Módulo | Rota base | Descrição |
|--------|-----------|-----------|
| Auth | `/auth` | Registro, login, JWT |
| Users | `/users` | Perfil de usuário |
| Produtores | `/produtores` | Perfil do produtor rural |
| Propriedades | `/propriedades` | Fazendas e glebas |
| Animais | `/animais` | Rebanho, eventos, pesagens, vacinas, reprodução |
| Culturas | `/culturas` | Plantio, colheita, área |
| Clima | `/clima` | Previsão do tempo via OpenWeather |
| Preços | `/precos` | Preços de commodities agrícolas |
| Financeiro | `/financeiro` | Receitas e despesas individuais por propriedade |
| Relatórios | `/relatorios` | Consolidação analítica financeira e de rebanho |
| Marketplace | `/marketplace` | Anúncios de compra e venda |
| Notificações | `/notificacoes` | Alertas e avisos |
| Admin | `/admin` | Painel administrativo |
| Plans | `/plans` | Planos de assinatura |
| Subscriptions | `/subscriptions` | Assinaturas de usuários |
| Onboarding | `/onboarding` | Fluxo de configuração inicial |

---

## Páginas do Frontend

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/dashboard` | Painel principal com clima, preços, saldo e alertas |
| Clima | `/clima` | Previsão de 7 dias com favoritos e alertas de chuva |
| Mercado | `/precos` | Preços de commodities em tempo real |
| Financeiro | `/financeiro` | Lançamento e visualização de receitas/despesas |
| Rebanho | `/animais` | Gestão de animais, vacinas, pesagens e reprodução |
| Relatórios | `/relatorios` | Relatório financeiro e de rebanho com exportação PDF |
| Marketplace | `/marketplace` | Compra e venda de produtos agrícolas |
| Admin | `/admin` | Configurações de perfil e propriedade |

---

## Diferença entre Financeiro e Relatórios

Estes dois módulos são frequentemente confundidos mas têm papéis distintos:

**Financeiro** (`/financeiro`) é o módulo **operacional** — onde o produtor registra cada transação individualmente: uma venda de animal, uma compra de ração, uma despesa de manutenção. É o equivalente a um caixa ou extrato bancário. Mostra o histórico filtrado por mês e categoria.

**Relatórios** (`/relatorios`) é o módulo **analítico** — ele não registra nada, apenas consolida e apresenta os dados já lançados no Financeiro e no módulo de Rebanho. Mostra o total de receitas x despesas, lucro líquido, evolução mensal dos últimos 6 meses, e distribuição por categoria. Também tem a visão do rebanho: total de animais por espécie, custo total e custo médio por animal com base nos eventos registrados. Os dados podem ser exportados em PDF.

Em resumo: **Financeiro = entrada de dados · Relatórios = visão consolidada dos dados**.

---

## API de Clima — Limitação da Versão Gratuita

O módulo de clima usa a [OpenWeather API](https://openweathermap.org/api) com a chave gratuita (`One Call API 3.0` ou `Forecast`). A **previsão gratuita tem limite de 7 dias** — para previsões de 14 ou 30 dias seria necessário assinar um plano pago da OpenWeather (a partir de USD 40/mês).

Por isso, a tela de Clima exibe apenas **7 dias de previsão**. Esta é uma limitação consciente de custo para um MVP — em um produto comercial real, o plano pago seria ativado.

---

## Marketplace — Dados Inseridos Manualmente

O marketplace foi pensado originalmente para ser alimentado por um **crawler do MercadoLivre** que rodaria diariamente às 3h via cron job (`apps/api/src/jobs/marketplace-crawler.job.ts`). O crawler buscaria anúncios de maquinários agrícolas (tratores, colheitadeiras, pulverizadores) e os importaria automaticamente.

**Porém**, a API pública de busca do MercadoLivre (`/sites/MLB/search`) passou a exigir **autenticação OAuth2** — o que antes era acessível anonimamente agora retorna `403 Forbidden`. Para usar a API de forma legal e autenticada, seria necessário:

1. Criar um aplicativo no [Portal de Desenvolvedores do Mercado Livre](https://developers.mercadolivre.com.br/)
2. Implementar o fluxo OAuth2 de autorização
3. Adicionar `ML_ACCESS_TOKEN` nas variáveis de ambiente

Como esta é uma restrição externa fora do controle do projeto, os **produtos do marketplace foram inseridos manualmente** via seed script com dados representativos do mercado agrícola (15 produtos em 5 categorias). O código do crawler está completo e funcionará assim que a autenticação ML for configurada — basta adicionar o token e acionar `POST /api/v1/marketplace/crawler/run`.

---

## Banco de Dados — Principais Modelos

```
User ──── Produtor ──── Propriedade ──┬── Receita
                                      ├── Despesa
                                      ├── Animal ──┬── AnimalEvento
                                      │            ├── Vacina
                                      │            ├── Pesagem
                                      │            └── Reproducao
                                      └── Cultura

User ──── Subscription ──── Plan
User ──── Notificacao
User ──── MarketplaceFavorito ──── MarketplaceProduct ──── Produtor
```

O modelo segue uma hierarquia clara: um **User** pode ser produtor rural. O produtor tem um perfil (**Produtor**) e um ou mais imóveis rurais (**Propriedade**). Todos os dados de negócio (animais, finanças, culturas) ficam vinculados à propriedade, o que permite escalar para múltiplas fazendas futuramente.

---

## Jobs Agendados (Cron)

| Job | Frequência | Função |
|-----|-----------|--------|
| Clima | A cada 6 horas | Atualiza previsão do tempo no banco |
| Preços | Diariamente às 8h | Atualiza preços de commodities |
| Alertas | A cada 30 minutos | Gera alertas de variação de preço |
| Notificações | A cada 10 minutos | Despacha notificações pendentes |
| Marketplace Crawler | Diariamente às 3h | Importa anúncios externos (requer OAuth ML) |

---

## Início Rápido

### Pré-requisitos

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14 (ou conta no [Supabase](https://supabase.com))
- Chave da [OpenWeather API](https://openweathermap.org/api) (gratuita)

### Instalação

```bash
# 1. Clonar o repositório
git clone <url-do-repo>
cd agro

# 2. Instalar dependências (todos os workspaces)
npm install

# 3. Configurar variáveis de ambiente
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env com suas credenciais

# 4. Gerar Prisma Client e rodar migrations
npm run db:generate
npm run db:migrate

# 5. Rodar tudo junto
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:3333  
Prisma Studio: `npm run db:studio`

### Variáveis de Ambiente (`apps/api/.env`)

```env
DATABASE_URL=postgresql://usuario:senha@host:6543/db?pgbouncer=true
DIRECT_URL=postgresql://usuario:senha@host:5432/db

PORT=3333
NODE_ENV=development

JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

OPENWEATHER_API_KEY=sua-chave-openweather

RATE_LIMIT_MAX=10000
RATE_LIMIT_WINDOW_MS=60000

LOG_LEVEL=info

ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=senhaforte123

# UUID do Produtor bot usado pelo marketplace crawler
# Crie um user com role ADMIN, complete o onboarding e cole o Produtor.id aqui
CRAWLER_PRODUTOR_ID=uuid-do-produtor-bot
```

---

## Deploy Recomendado

| Serviço | Plataforma recomendada |
|---------|----------------------|
| Frontend (`apps/web`) | [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) |
| Backend (`apps/api`) | [Render](https://render.com) (free tier disponível) |
| Banco de dados | [Supabase](https://supabase.com) (PostgreSQL gerenciado) |

---

## Scripts Disponíveis

```bash
# Raiz (monorepo)
npm run dev           # Frontend + API em paralelo
npm run dev:web       # Só o frontend (porta 5173)
npm run dev:api       # Só a API (porta 3333)
npm run build:web     # Build do React com Vite
npm run build:api     # Compilação TypeScript da API
npm run db:generate   # Gera o Prisma Client
npm run db:migrate    # Executa migrations pendentes
npm run db:studio     # Abre o Prisma Studio
```

---

## Considerações de MVP

Este projeto foi construído como um **MVP de portfólio** com as seguintes decisões conscientes:

- **Culturas sem página dedicada**: o modelo `Cultura` existe no banco e na API, mas a página de gestão de culturas no frontend ainda não foi desenvolvida. O módulo está scaffoldado para implementação futura.
- **Marketplace semi-manual**: o crawler está pronto mas depende de autenticação OAuth com o MercadoLivre. Os dados são populados via seed para demonstração.
- **Clima limitado a 7 dias**: limitação do plano gratuito da OpenWeather API.
- **Sem pagamento real**: o módulo de plans/subscriptions está estruturado mas sem integração com gateway de pagamento (Stripe, Pagar.me, etc.).
- **PWA installable**: o frontend é instalável como app em dispositivos móveis.

---

## Licença

MIT
