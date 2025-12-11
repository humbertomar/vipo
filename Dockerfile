# ===========================
# STAGE 1 - BUILD
# ===========================
FROM node:22-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos principais de dependências
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Copiar patches usados pelo pnpm (EX: patches/wouter@3.7.1.patch)
# IMPORTANTE: essa pasta precisa existir e estar versionada no Git.
COPY patches ./patches

# Copiar pasta do Prisma (schema, migrations, etc.)
COPY prisma ./prisma

# Instalar pnpm e dependências (SEM frozen-lockfile)
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gerar Prisma Client
RUN npx prisma generate

# Copiar o restante do código
COPY . .

# Build do frontend + backend
# No package.json:
# "build": "npm run build:client && npm run build:server"
RUN pnpm run build

# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine

WORKDIR /app

# Instalar ferramenta para gerenciar o processo principal
RUN apk add --no-cache dumb-init

# Copiar arquivos de dependências de produção
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instalar pnpm e apenas dependências de produção (SEM frozen-lockfile)
RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile

# Gerar Prisma Client no ambiente final
RUN npx prisma generate

# Copiar artefatos buildados do estágio anterior
# Frontend (Vite) normalmente builda em /app/dist
COPY --from=builder /app/dist ./dist

# Backend (Nest) buildado em /app/server/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json

# Criar diretório para uploads
RUN mkdir -p uploads && chmod 755 uploads

# Variáveis padrão
ENV NODE_ENV=production
ENV PORT=3000

# Expor porta do backend NestJS
EXPOSE 3000

# Healthcheck básico na API (ajuste a rota se necessário)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { if (r.statusCode !== 200) process.exit(1) }).on('error', () => process.exit(1))"

# Usar dumb-init para gerenciar o processo
ENTRYPOINT ["dumb-init", "--"]

# Comando de start — bate com teu package.json ("start" / "start:prod")
CMD ["node", "server/dist/main.js"]
