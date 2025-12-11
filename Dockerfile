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
RUN pnpm run build
# - vite build       -> dist/public
# - cd server && tsc -> dist/server (pelo tsconfig do Nest)


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

# Gera Prisma Client também na imagem final
RUN npx prisma generate

# Copia TUDO que foi buildado (front + back)
COPY --from=builder /app/dist ./dist

# Se precisar de diretório de uploads
RUN mkdir -p /app/uploads

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# 👉 Entry point do Nest: dist/server/main.js
CMD ["dumb-init", "node", "dist/server/main.js"]
