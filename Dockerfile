# ============================
# STAGE 1 - BUILD (front + back)
# ============================
FROM node:22-alpine AS builder

WORKDIR /app

# 1) Copia arquivos de dependência
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma
COPY patches ./patches

# 2) Instala pnpm + TODAS as dependências (dev + prod)
RUN npm install -g pnpm \
  && pnpm install --no-frozen-lockfile

# 3) Gera Prisma Client (v6.19.1 que já está no projeto)
RUN npx prisma generate

# 4) Copia o restante do código
COPY . .

# 5) Build do front (Vite) -> dist/public
RUN pnpm run build:client

# 6) Build do backend (Nest) -> server/dist/main.js
RUN pnpm run build:server


# ============================
# STAGE 2 - RUNTIME
# ============================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 1) dumb-init pra gerenciar sinais
RUN apk add --no-cache dumb-init

# 2) Copia somente o que precisa pra rodar
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma

# Copia node_modules pronto do builder (já com Prisma Client gerado)
COPY --from=builder /app/node_modules ./node_modules

# Copia front buildado e backend buildado
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Porta do backend
EXPOSE 3000

# Sobe o Nest compilado
CMD ["dumb-init", "node", "server/dist/main.js"]
