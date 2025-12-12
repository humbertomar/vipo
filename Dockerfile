# Imagem única (build + runtime) pra não ter mais dor de cabeça com COPY entre estágios
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# Dependências básicas
RUN apk add --no-cache dumb-init openssl

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
COPY patches ./patches

# Instala pnpm e TODAS as dependências (dev + prod) para conseguir buildar
RUN npm install -g pnpm \
  && pnpm install --no-frozen-lockfile

# Gera Prisma Client
RUN npx prisma generate

# Copia o restante do código (client, server, shared, configs, etc.)
COPY . .

# Builda front + back exatamente como você faz local
# (build:client -> vite build, build:server -> cd server && tsc)
RUN pnpm run build

# Variáveis padrão
ENV NODE_ENV=production
ENV PORT=3001

# Expõe a porta do backend
EXPOSE 3001

# Sobe o Nest compilado
CMD ["dumb-init", "node", "server/dist/main.js"]
