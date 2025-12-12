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
COPY scripts ./scripts

# Instala pnpm e TODAS as dependências (dev + prod) para conseguir buildar
RUN npm install -g pnpm \
  && pnpm install --no-frozen-lockfile

# Gera Prisma Client
RUN npx prisma generate

# Copia o restante do código (client, server, shared, configs, etc.)
COPY . .

# Instala tsx globalmente para rodar TypeScript diretamente
RUN npm install -g tsx

# Builda apenas o frontend (backend roda com tsx diretamente do TypeScript)
RUN pnpm run build:client

# Torna executável o script de start
RUN chmod +x /app/scripts/start.sh

# Variáveis padrão
ENV NODE_ENV=production
ENV PORT=3001

# Expõe a porta do backend
EXPOSE 3001

# Usa o script de start que executa migrações antes de iniciar
CMD ["/app/scripts/start.sh"]
