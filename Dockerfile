# ===========================
# STAGE 1 - BUILDER
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# Pacotes e lock
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client na build (usa a versão do projeto, 6.19.1)
RUN npx prisma generate

# Copia todo o código
COPY . .

# Build frontend + backend
RUN pnpm run build
# (equivale a: npm run build:client && npm run build:server)

# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

# Dependências em produção
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile

# Copia somente o que foi buildado
COPY --from=builder /app/dist ./dist

# Diretório para uploads (se precisar)
RUN mkdir -p /app/uploads

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# 👉 Entry point correto do Nest
CMD ["dumb-init", "node", "dist/src/main.js"]
