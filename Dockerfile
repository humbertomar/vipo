# ============================
# STAGE 1 - BUILD (front + back)
# ============================
FROM node:22-alpine AS builder

WORKDIR /app

# Algumas libs (Prisma, etc.) precisam de OpenSSL
RUN apk add --no-cache openssl

# Copia arquivos principais de dependências
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala TODAS as dependências (dev + prod) para build
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Gera Prisma Client no ambiente de build
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Aqui usamos o MESMO build que você já usava localmente:
#  - build:client (Vite) → gera dist/public
#  - build:server       → compila o backend (Nest)
RUN pnpm run build

# ============================
# STAGE 2 - RUNTIME
# ============================
FROM node:22-alpine AS runner

WORKDIR /app

# dumb-init pra lidar bem com sinais no container
# openssl pra Prisma/DB
RUN apk add --no-cache dumb-init openssl

# Copia package/lock pra instalar apenas deps de runtime
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Instala SOMENTE dependências de produção
RUN npm install -g pnpm && pnpm install --prod --no-frozen-lockfile

# Copia pasta prisma (schema etc)
COPY prisma ./prisma

# Copia TUDO que foi buildado no estágio anterior:
#  - dist/public  -> front (Vite)
#  - dist/server  -> back (Nest compilado)
COPY --from=builder /app/dist ./dist

# Gera Prisma Client DENTRO da imagem final usando a mesma versão 6.x
RUN npx prisma@6.19.1 generate

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# IMPORTANTE:
#  - "--experimental-default-type=commonjs" faz Node tratar .js como CommonJS
#    mesmo com "type": "module" no package.json da raiz.
#  - O Nest compilado, pelo padrão, costuma ficar em dist/server/main.js
CMD ["dumb-init", "node", "--experimental-default-type=commonjs", "dist/server/main.js"]
