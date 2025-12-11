# 🚀 Guia de Deploy para Produção - ViPO eCommerce

Este guia apresenta **duas opções** de deploy: **Monolito** (tudo junto) e **Separado** (backend e frontend independentes).

---

## 📋 Opção 1: Deploy Monolito (Recomendado para começar)

**Vantagens:**
- ✅ Mais simples de configurar
- ✅ Um único servidor para gerenciar
- ✅ Menor custo inicial
- ✅ Ideal para projetos pequenos/médios

**Desvantagens:**
- ⚠️ Frontend e backend acoplados
- ⚠️ Escalabilidade limitada
- ⚠️ Rebuild completo ao atualizar qualquer parte

### Como funciona:

O backend NestJS serve tanto a API quanto os arquivos estáticos do frontend buildado.

### Passos para Deploy:

#### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Ambiente
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL="postgresql://user:password@host:5432/vipo_prod"

# JWT
JWT_SECRET="seu-secret-super-seguro-aqui-mude-isso"

# CORS - URL do seu frontend em produção
FRONTEND_URL="https://seu-dominio.com"

# Upload/Storage (opcional)
S3_BUCKET="seu-bucket"
S3_REGION="us-east-1"
AWS_ACCESS_KEY_ID="sua-key"
AWS_SECRET_ACCESS_KEY="sua-secret"
```

#### 2. Build do projeto

```bash
# Instalar dependências
npm install

# Build do frontend
npm run build

# Build do backend (se necessário)
cd server && npm run build
```

#### 3. Configurar servidor para servir arquivos estáticos

✅ **Já configurado!** O `app.module.ts` já está configurado para servir o frontend em produção automaticamente.

#### 4. Deploy com Docker (Recomendado)

```bash
# Build da imagem
docker build -t vipo-ecommerce:latest .

# Executar container
docker run -d \
  --name vipo-ecommerce \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  vipo-ecommerce:latest
```

#### 5. Deploy manual (VPS/Server)

```bash
# No servidor
git clone seu-repositorio
cd vipo-ecommerce
npm install
npm run build

# Usar PM2 para gerenciar processo
npm install -g pm2
pm2 start server/src/main.js --name vipo-api
pm2 save
pm2 startup
```

---

## 📋 Opção 2: Deploy Separado (Recomendado para escalar)

**Vantagens:**
- ✅ Escalabilidade independente
- ✅ Frontend pode usar CDN (Cloudflare, Vercel, Netlify)
- ✅ Backend pode escalar horizontalmente
- ✅ Deploy independente de cada parte
- ✅ Melhor performance (CDN para assets)

**Desvantagens:**
- ⚠️ Mais complexo de configurar
- ⚠️ Precisa configurar CORS corretamente
- ⚠️ Dois servidores para gerenciar

### Como funciona:

- **Frontend**: Buildado e servido via CDN ou servidor estático (Vercel, Netlify, Cloudflare Pages)
- **Backend**: API REST rodando em servidor separado (Railway, Render, AWS, DigitalOcean)

### Passos para Deploy:

#### Frontend (Vercel/Netlify/Cloudflare Pages)

1. **Build do frontend:**
```bash
npm run build
```

2. **Configurar variáveis de ambiente no provedor:**
```env
VITE_API_URL=https://api.seudominio.com
```

3. **Deploy:**
   - **Vercel**: Conecte o repositório, configure build command: `npm run build`, output: `dist/public`
   - **Netlify**: Mesmo processo
   - **Cloudflare Pages**: Mesmo processo

#### Backend (Railway/Render/AWS/DigitalOcean)

1. **Configurar variáveis de ambiente:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
FRONTEND_URL="https://seudominio.com"  # URL do frontend
```

2. **Deploy:**
   - **Railway**: Conecte repositório, configure start command: `cd server && npm start`
   - **Render**: Mesmo processo
   - **DigitalOcean App Platform**: Configure build: `npm install && cd server && npm run build`, start: `node dist/main.js`

3. **Configurar CORS no backend:**
```typescript
// server/src/main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'https://seudominio.com',
  credentials: true,
});
```

---

## 🐳 Docker Compose (Opção Monolito)

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${DB_USER:-vipo}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=${DB_NAME:-vipo}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Execute:
```bash
docker-compose up -d
```

---

## 🔧 Configurações Importantes

### 1. Banco de Dados

```bash
# Aplicar migrations em produção
npx prisma migrate deploy

# Gerar Prisma Client
npx prisma generate
```

### 2. SSL/HTTPS

- Use **Let's Encrypt** (gratuito) com Certbot
- Ou configure no seu provedor (Vercel, Railway, etc.)

### 3. Variáveis de Ambiente

**Nunca commite** arquivos `.env` no git. Use:
- Variáveis de ambiente do provedor
- Secrets management (AWS Secrets Manager, etc.)

### 4. Logs e Monitoramento

- Configure logs estruturados
- Use serviços como Sentry para erros
- Configure health checks

---

## 📊 Comparação das Opções

| Aspecto | Monolito | Separado |
|---------|----------|----------|
| **Complexidade** | ⭐ Simples | ⭐⭐⭐ Complexo |
| **Custo** | ⭐⭐ Médio | ⭐⭐⭐ Alto |
| **Escalabilidade** | ⭐⭐ Limitada | ⭐⭐⭐ Excelente |
| **Performance** | ⭐⭐ Boa | ⭐⭐⭐ Excelente (CDN) |
| **Manutenção** | ⭐⭐ Fácil | ⭐⭐⭐ Média |
| **Ideal para** | Pequeno/Médio | Grande/Escala |

---

## 🎯 Recomendação

**Para começar:** Use **Opção 1 (Monolito)** com Docker
- Mais simples
- Funciona bem para a maioria dos casos
- Fácil de migrar depois

**Para escalar:** Migre para **Opção 2 (Separado)**
- Quando tiver muito tráfego
- Quando precisar escalar backend independente
- Quando quiser usar CDN para assets

---

## 🚨 Checklist de Produção

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados em produção configurado
- [ ] Migrations aplicadas
- [ ] SSL/HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Logs configurados
- [ ] Backup do banco de dados automatizado
- [ ] Health checks configurados
- [ ] Monitoramento de erros (Sentry, etc.)
- [ ] Rate limiting configurado
- [ ] Secrets não commitados no git

---

## 📞 Suporte

Para dúvidas sobre deploy, consulte a documentação do seu provedor ou entre em contato com o time de desenvolvimento.
