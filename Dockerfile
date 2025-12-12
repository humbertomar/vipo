# ============================
# STAGE 1 - BUILD (front + back)
# ============================
FROM node:22-alpine AS builder

WORKDIR /app

# Algumas libs (Prisma, etc.) gostam de OpenSSL
RUN apk add --no-cache openssl

# Copia arquivos básicos de dependência
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala TODAS as dependências (dev + prod)
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Gera o Prisma Client no ambiente de build
RUN npx prisma generate

# Copia o resto do código
COPY . .

# ---------- FRONTEND ----------
# Usa o script existente para buildar o client (Vite)
# Isso gera os arquivos estáticos em /app/dist/public
RUN pnpm run build:client

# ---------- BACKEND ----------
# Agora compilamos o Nest (server) manualmente com tsc,
# forçando EMISSÃO de JS e um outDir fixo: ../dist-server
# Assim, o main.ts vira dist-server/src/main.js
RUN cd server && npx tsc --project tsconfig.json --noEmit false --outDir ../dist-server

# ============================
# STAGE 2 - RUNTIME
# ============================
FROM node:22-alpine AS runner

WORKDIR /app

# dumb-init pra lidar bem com sinais no container
# openssl pra Prisma/DB
RUN apk add --no-cache dumb-init openssl

# Copia package/lock pra instalar apenas dependências de runtime
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Instala SOMENTE dependências de produção
RUN npm install -g pnpm && pnpm install --prod --no-frozen-lockfile

# Copia a pasta prisma (schema, etc.)
COPY prisma ./prisma

# Copia os artefatos de build do estágio anterior:
# - dist  -> frontend (Vite) em dist/public
# - dist-server -> backend (Nest compilado) em dist-server/src/main.js
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Gera o Prisma Client DENTRO da imagem final
# Usando Prisma 6.x pra não dar erro do "url não suportado"
RUN npx prisma@6.19.1 generate

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# IMPORTANTE:
#  - "--experimental-default-type=commonjs" faz o Node tratar .js como CommonJS
#    mesmo com "type": "module" no package.json da raiz.
#  - O entrypoint do Nest compilado está em dist-server/src/main.js
CMD ["dumb-init", "node", "--experimental-default-type=commonjs", "dist-server/src/main.js"]
