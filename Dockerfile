# ===========================
# STAGE 1 - BUILDER
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia manifests e config de workspace
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Patches (wouter etc)
COPY patches ./patches

# Prisma (schema + migrations)
COPY prisma ./prisma

# Instala pnpm + dependências (com dev)
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client no builder
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Build:
# - Frontend: Vite -> dist/public
# - Backend:  tsc em server -> dist/server
RUN pnpm run build
# (equivale a: npm run build:client && npm run build:server)

# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine

WORKDIR /app

# dumb-init pra lidar com sinais corretamente
RUN apk add --no-cache dumb-init

# Copia package.json e lockfile da raiz
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Patches e prisma (apenas o necessário)
COPY patches ./patches
COPY prisma ./prisma

# Instala só dependências de produção
RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile

# Gera Prisma Client na imagem final também
# (fixando a versão 6.19.1 pra bater com o schema e com @prisma/client)
RUN npx prisma@6.19.1 generate

# Copia artefatos buildados do builder:
# - dist/public  (frontend)
# - dist/server  (backend Nest)
COPY --from=builder /app/dist ./dist

# Diretório para uploads (se você for usar)
RUN mkdir -p /app/uploads

# Variáveis padrão
ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# Sobe o backend Nest compilado em dist/server/main.js
CMD ["dumb-init", "node", "dist/server/main.js"]
