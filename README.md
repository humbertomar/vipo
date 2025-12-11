# ViPO eCommerce

**Sungas com atitude para quem vive o impossível.**

eCommerce completo para a marca ViPO, especializada em uniformes e sungas para futevôlei. Desenvolvido com tecnologias modernas e padrões de produção.

## 🏗️ Arquitetura

### Stack Tecnológico

- **Frontend**: React 19 + Vite + TypeScript + TailwindCSS
- **Backend**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT + OAuth
- **Infraestrutura**: Docker + Docker Compose
- **Qualidade**: ESLint + Prettier + Vitest

### Estrutura do Projeto

```
vipo-ecommerce/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Utilitários e hooks
│   └── public/            # Assets estáticos
├── server/                # Backend NestJS
│   └── src/
│       ├── modules/       # Módulos de funcionalidades
│       ├── common/        # DTOs e utilitários compartilhados
│       ├── config/        # Configuração da aplicação
│       └── database/      # Serviço Prisma
├── prisma/               # Schema e migrations Prisma
├── generated/            # Código gerado (Prisma Client)
└── shared/              # Código compartilhado entre frontend e backend
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- PostgreSQL (obrigatório)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados (desenvolvimento)
npm db:push

# Popular banco de dados com dados iniciais
npm db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Criar arquivo `.env.local` com as seguintes variáveis:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@localhost:5432/vipo_dev"

# JWT
JWT_SECRET="seu-secret-key-aqui"

# Pagamentos (Pagar.me ou Mercado Pago)
PAGARMEE_API_KEY="sk_test_..."
MERCADO_PAGO_API_KEY="APP_USR_..."

# Frete (Melhor Envio)
MELHOR_ENVIO_API_KEY="seu-token-aqui"

# Storage (S3)
S3_BUCKET="seu-bucket"
S3_REGION="us-east-1"

# Frontend
FRONTEND_URL="http://localhost:5173"
```

## 📦 Módulos Principais

### Backend (NestJS)

#### Auth Module
- Autenticação com JWT
- Registro e login de usuários
- Validação de tokens

#### Users Module
- Gerenciamento de perfil
- Endereços e dados pessoais
- Histórico do cliente

#### Cart Module
- Gerenciamento de carrinho de compras
- Persistência de itens
- Associação com usuário ou sessão anônima

#### Products Module
- CRUD de produtos
- Variações (tamanho, cor)
- Atributos (tecido, elasticidade, etc.)
- Gerenciamento de estoque

#### Orders Module
- Criação de pedidos (E-commerce e PDV)
- Histórico de status
- Cálculo de totais

#### Payments (Integration)
- Integração com Pagar.me/Mercado Pago
- Processamento de PIX e cartão
- Parcelamento

#### Shipping (Integration)
- Integração com Melhor Envio
- Cálculo de frete
- Rastreamento

#### Categories & Collections
- Gerenciamento de categorias
- Organização de coleções temáticas

#### Coupons Module
- Criação de cupons de desconto
- Validação e aplicação

### Frontend (React)

- **Home**: Landing page com hero e destaques
- **Catálogo**: Listagem de produtos com filtros
- **Produto**: Página de detalhe com variações
- **Carrinho**: Carrinho persistente
- **Checkout**: Fluxo de compra completo
- **Minha Conta**: Perfil, pedidos, endereços
- **Admin Dashboard**: Gerenciamento de produtos, pedidos, clientes, **Venda Manual (PDV)**

## 🗄️ Banco de Dados

### Schema Prisma

O schema inclui modelos para:

- **Users**: Usuários do sistema
- **Products**: Produtos e variações
- **Orders**: Pedidos e itens
- **Payments**: Pagamentos
- **Shipments**: Envios
- **Returns**: Devoluções
- **Coupons**: Cupons de desconto
- **Audit Logs**: Registro de ações

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npm run db:push

# Resetar banco de dados (desenvolvimento)
npm run db:reset
```

## 🔐 Segurança

- Senhas com bcrypt (salt rounds: 10)
- JWT com expiração configurável
- CSRF protection em rotas sensíveis
- Helmet para headers de segurança
- Validação de entrada com class-validator
- Rate limiting em auth e checkout

## 📊 Integrações Brasileiras

### Pagamentos - AINDA NÃO IMPLEMENTADO
- **Pagar.me**: PIX, Cartão, Boleto
- **Mercado Pago**: PIX, Cartão com parcelamento

### Frete - AINDA NÃO IMPLEMENTADO
- **Melhor Envio**: Cotação e geração de etiquetas
- **Correios**: Via Melhor Envio

### CEP/Endereço
- **ViaCEP**: Autocompletar endereço por CEP
- **BrasilAPI**: Alternativa para ViaCEP

### Notificações
- **WhatsApp**: Evolution API para notificações de pedidos
- **Email**: SMTP configurável

## 🎨 Design & Branding

- **Cores**: Preto & Branco (modo dark/clean)
- **Tipografia**: Pairing moderno e legível
- **Layout**: Mobile-first, responsivo
- **Acessibilidade**: WCAG AA
- **Performance**: Lighthouse 90+

## 🧪 Testes

```bash
# Executar testes
npm run test

# Testes com coverage
npm run test -- --coverage

# Testes e2e (Playwright)
npm run test:e2e
```

## 📝 Linting & Formatting

```bash
# Verificar erros TypeScript
npm run check

# Formatar código
npm run format

# Lint com ESLint
npm run lint
```

## 🐳 Docker

```bash
# Build da imagem
docker build -t vipo-ecommerce .

# Executar container
docker run -p 3000:3000 -p 5173:5173 vipo-ecommerce

# Com Docker Compose
docker-compose up
```

## 📚 API Endpoints

### Auth
- `POST /auth/signup` - Registrar novo usuário
- `POST /auth/signin` - Login
- `GET /auth/me` - Dados do usuário autenticado

### Products
- `GET /products` - Listar produtos
- `GET /products/:id` - Detalhes do produto
- `POST /products` - Criar produto (admin)
- `PUT /products/:id` - Atualizar produto (admin)
- `DELETE /products/:id` - Deletar produto (admin)

### Orders
- `GET /orders` - Listar pedidos do usuário
- `POST /orders` - Criar pedido
- `GET /orders/:id` - Detalhes do pedido
- `PUT /orders/:id/status` - Atualizar status (admin)

### Categories
- `GET /categories` - Listar categorias
- `POST /categories` - Criar categoria (admin)

### Coupons
- `POST /coupons/validate` - Validar cupom
- `GET /coupons` - Listar cupons (admin)

## 🚢 Deployment

### Variáveis de Produção

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/vipo"
JWT_SECRET="use-um-secret-seguro"
# ... outras variáveis
```

### Build

```bash
pnpm build
pnpm start
```

## 📖 Documentação Adicional

- [Prisma Documentation](https://www.prisma.io/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribuindo

1. Criar uma branch para sua feature
2. Fazer commit das mudanças
3. Push para a branch
4. Abrir um Pull Request

## 📄 Licença

MIT

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com o time de desenvolvimento.

---

**ViPO - Sungas com atitude para quem vive o impossível.**

