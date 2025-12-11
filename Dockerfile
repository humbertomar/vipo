# #######################################################
# STAGE 1: Builder - instala tudo, gera Prisma Client
# e builda frontend (Vite) + backend (NestJS)
# #######################################################
FROM node:22-alpine AS builder

WORKDIR /app

# Dependências do sistema necessárias (se precisar de openssl pra Prisma, etc)
RUN apk add --no-cache openssl

# Copia manifestos do monorepo
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala pnpm e TODAS as dependências (dev + prod)
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client usando a versão do projeto (6.x)
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Build:
# - client: Vite → dist/public
# - server: tsc dentro de /server → server/dist
RUN pnpm run build


# #######################################################
# STAGE 2: Runtime - só o necessário pra rodar em produção
# #######################################################
FROM node:22-alpine

WORKDIR /app

# dumb-init pra não deixar processo zumbi / sinal mal tratado
RUN apk add --no-cache dumb-init

# Copia manifestos + Prisma schema pro runtime
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala SOMENTE dependências de produção
RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile

# Prisma 7 não aceita mais `url = env("DATABASE_URL")`,
# então aqui a gente força explicitamente Prisma 6
RUN npx prisma@6.19.1 generate

# Copia os artefatos buildados do builder:
# - Frontend já está em /app/dist/public
# - Backend Nest compilado em /app/server/dist
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# (Opcional) diretório de uploads, se você usar
RUN mkdir -p /app/uploads

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# Sobe o Nest já compilado
# Certifique-se de que o entrypoint compilado é server/dist/main.js
CMD ["dumb-init", "node", "server/dist/main.js"]
