# ===========================
# STAGE 1 - BUILDER
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia definição de pacotes e lockfile
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala dependências (dev + prod) para build
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client usando a versão do projeto
RUN npx prisma generate

# Copia todo o código do repo
COPY . .

# Build frontend + backend
# (chama "vite build" e depois "cd server && tsc")
RUN pnpm run build


# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

# Dependências de runtime (somente prod)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile

# Frontend buildado (Vite) → dist/public
COPY --from=builder /app/dist ./dist

# Backend buildado (Nest) → server/dist
# (pasta gerada pelo "cd server && tsc")
COPY --from=builder /app/server/dist ./server/dist

# Se precisar de diretório de uploads
RUN mkdir -p /app/uploads

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# 👉 Entry point do Nest: server/dist/main.js
CMD ["dumb-init", "node", "server/dist/main.js"]
