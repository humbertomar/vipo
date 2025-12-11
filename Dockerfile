# #######################################################
# STAGE 1: Builder - Front (Vite) + Back (Nest)
# #######################################################
FROM node:22-alpine AS builder

WORKDIR /app

# Dependências de sistema (ajuda com Prisma/OpenSSL)
RUN apk add --no-cache openssl

# Manifests do monorepo
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala pnpm e TODAS as dependências (dev + prod)
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client (v6.19.1 - o do projeto)
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Build:
# - client: vite build => dist/public
# - server: cd server && tsc
RUN pnpm run build

# Descobre automaticamente onde está o main.js do backend
RUN set -e; \
  echo '--- Procurando main.js do Nest no projeto ---'; \
  find . -maxdepth 8 -type f -name "main.js" -print || true; \
  MAIN_PATH=$(find . -maxdepth 8 -type f -name "main.js" | head -n 1); \
  if [ -z "$MAIN_PATH" ]; then \
    echo 'ERRO: Nenhum main.js encontrado. Verifique o outDir do tsc (tsconfig) e o script "build:server".'; \
    exit 1; \
  fi; \
  echo "main.js encontrado em: $MAIN_PATH"; \
  # remove prefixo ./ se existir
  MAIN_PATH="${MAIN_PATH#./}"; \
  echo "Gerando entry.js apontando para: $MAIN_PATH"; \
  printf "require('./%s');\n" "$MAIN_PATH" > entry.js; \
  echo 'entry.js criado com sucesso.'


# #######################################################
# STAGE 2: Runner - imagem final de produção
# #######################################################
FROM node:22-alpine AS runner

WORKDIR /app

# dumb-init para tratar sinais corretamente
RUN apk add --no-cache dumb-init

# Copia TUDO que montamos no builder (código, dist, node_modules, entry.js, etc.)
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Sobe o backend via entry.js (que faz require do main.js real)
CMD ["dumb-init", "node", "entry.js"]
