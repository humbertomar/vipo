# #######################################################
# STAGE 1: Builder - instala deps, gera Prisma Client
# e builda frontend (Vite) + backend (Nest)
# #######################################################
FROM node:22-alpine AS builder

WORKDIR /app

# Dependências de sistema (openssl ajuda com Prisma)
RUN apk add --no-cache openssl

# Manifestos do monorepo
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala pnpm + TODAS as deps (dev + prod)
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client usando a versão do projeto (6.19.1)
RUN npx prisma generate

# Copia o resto do código
COPY . .

# Build:
# - client: vite build  -> dist/public
# - server: cd server && tsc
RUN pnpm run build

# Gera um entry.js apontando pro main compilado do backend
RUN node - <<'EOF'
const fs = require('fs');

const candidates = [
  'server/dist/main.js',
  'dist/server/main.js',
  'dist/main.js',
  'server/src/main.js',
  'dist/src/main.js',
];

const found = candidates.find((p) => fs.existsSync(p));

if (!found) {
  console.error('Nenhum entrypoint Nest encontrado. Verifique tsconfig / script build:server.');
  console.error('Candidatos testados:', candidates);
  process.exit(1);
}

fs.writeFileSync(
  'entry.js',
  `require("./${found.replace(/\\/g, "/")}");\n`,
);

console.log('Entry gerado ->', found);
EOF


# #######################################################
# STAGE 2: Runner - imagem final de produção
# #######################################################
FROM node:22-alpine AS runner

WORKDIR /app

# dumb-init pra lidar bem com sinais no container
RUN apk add --no-cache dumb-init

# Copia TUDO que foi preparado no builder
COPY --from=builder /app . 

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# Sobe o backend via entry.js, que redireciona pro main real
CMD ["dumb-init", "node", "entry.js"]
