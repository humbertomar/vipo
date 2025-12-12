# ============================
# STAGE 1 - BUILD (front + back)
# ============================
FROM node:22-alpine AS builder

# Diretório de trabalho
WORKDIR /app

# Copia apenas arquivos de dependência primeiro (cache)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma
COPY patches ./patches 2>/dev/null || true

# pnpm global e deps completas (dev + prod, pra buildar tudo)
RUN npm install -g pnpm \
  && pnpm install --no-frozen-lockfile

# Gera Prisma Client (usa prisma@6.19.1 do projeto)
RUN npx prisma generate

# Agora copia o resto do código
COPY . .

# Build do front
RUN pnpm run build:client

# Build do backend (Nest), que deve gerar server/dist/main.js
RUN pnpm run build:server

# ============================
# STAGE 2 - RUNTIME
# ============================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# dumb-init pra não zoar signal/kill
RUN apk add --no-cache dumb-init

# Copia apenas o necessário de runtime
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma

# Instala SÓ deps de produção
RUN npm install -g pnpm \
  && pnpm install --prod --no-frozen-lockfile

# Copia artefatos buildados do builder:
# - frontend Vite em /dist/public
# - backend Nest em /server/dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Porta do backend
EXPOSE 3000

# Sobe o Nest compilado
CMD ["dumb-init", "node", "server/dist/main.js"]
