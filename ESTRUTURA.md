# Estrutura do Projeto VIPO eCommerce

## 📁 Estrutura de Pastas (Após Reorganização)

```
vipo-ecommerce/
├── 📂 client/                      # Frontend React + Vite
│   ├── 📂 public/                  # Arquivos estáticos
│   ├── 📂 src/
│   │   ├── 📂 _core/               # Core utilities
│   │   │   └── 📂 hooks/           # Custom hooks
│   │   ├── 📂 components/          # Componentes React
│   │   │   └── 📂 ui/              # Componentes UI (shadcn)
│   │   ├── 📂 contexts/            # React Contexts
│   │   │   ├── CartContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── 📂 hooks/               # Hooks customizados
│   │   ├── 📂 lib/                 # Bibliotecas e utils
│   │   ├── 📂 pages/               # ✨ REORGANIZADO
│   │   │   ├── 📂 public/          # Páginas públicas
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Catalog.tsx
│   │   │   │   ├── Product.tsx
│   │   │   │   ├── Cart.tsx
│   │   │   │   ├── Checkout.tsx
│   │   │   │   └── Contact.tsx
│   │   │   ├── 📂 admin/           # Páginas administrativas
│   │   │   │   └── Admin.tsx
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── const.ts
│   └── index.html
│
├── 📂 server/                      # Backend NestJS
│   ├── 📂 _core/                   # Core utilities (legado)
│   │   ├── context.ts
│   │   ├── env.ts
│   │   ├── imageGeneration.ts
│   │   ├── index.ts
│   │   ├── llm.ts
│   │   ├── notification.ts
│   │   ├── oauth.ts
│   │   ├── sdk.ts
│   │   ├── types/
│   │   │   └── authTypes.ts        # ✨ Renomeado de manusTypes.ts
│   │   └── vite.ts
│   │
│   └── 📂 src/                     # NestJS Application
│       ├── 📂 common/              # Shared resources
│       │   ├── 📂 decorators/
│       │   └── 📂 guards/
│       ├── 📂 config/              # Configuration
│       │   └── configuration.ts
│       ├── 📂 database/            # Database
│       │   └── prisma.service.ts
│       ├── 📂 modules/             # Feature modules
│       │   ├── 📂 addresses/
│       │   ├── 📂 auth/
│       │   ├── 📂 cart/
│       │   ├── 📂 categories/
│       │   ├── 📂 collections/
│       │   ├── 📂 coupons/
│       │   ├── 📂 customers/
│       │   ├── 📂 inventory/
│       │   ├── 📂 orders/
│       │   ├── 📂 payments/
│       │   ├── 📂 products/
│       │   ├── 📂 returns/
│       │   ├── 📂 settings/
│       │   ├── 📂 shipments/
│       │   ├── 📂 users/
│       │   ├── 📂 webhooks/
│       │   └── 📂 wishlist/
│       ├── app.module.ts
│       └── main.ts                 # ✨ Entry point do NestJS
│
├── 📂 prisma/                      # Prisma ORM
│   ├── 📂 migrations/              # Database migrations
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Database seeding
│
├── 📂 generated/                   # Arquivos gerados
│   └── 📂 prisma/                  # Prisma Client gerado
│
├── 📂 shared/                      # Código compartilhado
│   ├── 📂 _core/
│   │   └── errors.ts
│   ├── const.ts
│   └── types.ts                    # ✨ Removido export drizzle
│
├── 📂 patches/                     # Patches de dependências
│   └── wouter@3.7.1.patch
│
├── 📂 .gemini/                     # Artifacts do Gemini
│   └── 📂 antigravity/
│       └── 📂 brain/
│           └── 📂 9b69b7c9.../
│               ├── task.md
│               ├── walkthrough.md
│               └── implementation_plan.md
│
├── 📄 .env                         # Environment variables
├── 📄 .env.local                   # Local environment (usado pelo dev)
├── 📄 .env.example                 # Environment template
├── 📄 .gitignore
├── 📄 .dockerignore
├── 📄 Dockerfile
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 prisma.config.ts             # ✨ Prisma configuration
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 vitest.config.ts
├── 📄 components.json              # shadcn/ui config
└── 📄 README.md

```

## 🗑️ Arquivos Removidos (Limpeza)

### Drizzle ORM (Removido)
- ❌ `drizzle/` - Pasta inteira do Drizzle schema
- ❌ `drizzle.config.ts` - Configuração do Drizzle
- ❌ `server/db.ts` - Database helper do Drizzle

### Servidor Legado (Removido)
- ❌ `server-simple.ts` - Servidor Express antigo
- ❌ `server/routers.ts` - Rotas tRPC antigas
- ❌ `server/storage.ts` - Módulo de storage antigo

### Configurações Desnecessárias (Removidas)
- ❌ `.prettierrc` - Não estava sendo usado
- ❌ `.prettierignore` - Não estava sendo usado
- ❌ `vite.config.ts.bak` - Backup desnecessário
- ❌ `client/src/pages/ComponentShowcase.tsx` - Apenas para testes

## 📝 Arquivos Renomeados

| Antes | Depois | Motivo |
|-------|--------|--------|
| `server/_core/types/manusTypes.ts` | `server/_core/types/authTypes.ts` | Remover referência "Manus" |
| `client/src/components/ManusDialog.tsx` | `client/src/components/AuthDialog.tsx` | Remover referência "Manus" |

## 🎯 Estrutura Atual vs Anterior

### Antes da Reorganização
```
client/src/pages/
├── Home.tsx
├── Catalog.tsx
├── Product.tsx
├── Cart.tsx
├── Checkout.tsx
├── Contact.tsx
├── Admin.tsx
├── NotFound.tsx
└── ComponentShowcase.tsx
```

### Depois da Reorganização ✨
```
client/src/pages/
├── public/              # Rotas públicas (sem auth)
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── Product.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   └── Contact.tsx
├── admin/               # Rotas admin (com auth)
│   └── Admin.tsx
└── NotFound.tsx
```

## 🔧 Tecnologias Principais

### Frontend
- **React 19** - UI Library
- **Vite 7** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Routing
- **React Query** - Data fetching

### Backend
- **NestJS 11** - Framework
- **Prisma 6** - ORM
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **Express** - HTTP server

### DevOps
- **Docker** - Containerization
- **tsx** - TypeScript execution
- **dotenv** - Environment variables

## 📊 Estatísticas do Projeto

- **Arquivos Deletados**: 12
- **Arquivos Movidos**: 7 (páginas frontend)
- **Arquivos Renomeados**: 2
- **Dependências Removidas**: 3 (drizzle-orm, drizzle-kit, mysql2)
- **Linhas de Código Limpas**: ~500+

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia frontend + backend
npm run dev:server       # Apenas backend (NestJS)
npm run dev:frontend     # Apenas frontend (Vite)

# Build
npm run build            # Build do frontend

# Database
npm run db:push          # Sync schema com DB
npm run db:migrate       # Criar migration
npm run db:seed          # Popular DB com dados
npm run db:reset         # Reset completo do DB

# Qualidade
npm run check            # TypeScript check
npm run format           # Format com Prettier
npm run test             # Rodar testes
```

## 📌 Notas Importantes

> [!IMPORTANT]
> O projeto agora usa **apenas Prisma ORM**. Todo código Drizzle foi removido.

> [!WARNING]
> Alguns módulos foram comentados temporariamente (`routers.ts`, `storage.ts`). Você precisará recriá-los ou adaptar o código.

> [!NOTE]
> A estrutura de páginas está organizada em `public/` e `admin/`, facilitando a separação de responsabilidades.
