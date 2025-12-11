########################################################
# STAGE 1: Builder - Vite (cliente) + Nest (backend)
########################################################
FROM node:22-alpine AS builder

WORKDIR /app

# Dependências de sistema (útil pra Prisma / OpenSSL)
RUN apk add --no-cache openssl

# Manifests do monorepo
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

# Instala pnpm e TODAS as dependências (dev + prod)
RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

# Gera Prisma Client (v6.19.1 do projeto)
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Build:
# - front: vite build -> dist/public
# - back: cd server && tsc
RUN pnpm run build

# Descobre automaticamente o main.js do backend (ignorando node_modules)
RUN node - <<'EOF'
const fs = require('fs');
const { execSync } = require('child_process');

console.log('--- Procurando main.js do Nest ---');

const candidatesPreferidos = [
  'server/dist/main.js',
  'dist/server/main.js',
  'dist/main.js',
];

let found = candidatesPreferidos.find((p) => fs.existsSync(p));

if (!found) {
  console.log('Nenhum dos caminhos preferidos encontrado, rodando find em ./server e ./dist ...');
  try {
    const output = execSync(
      "find server dist -maxdepth 8 -type f -name 'main.js' ! -path '*node_modules*' ! -path '*patches*' 2>/dev/null",
      { encoding: 'utf8' },
    );
    const paths = output
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    console.log('Caminhos encontrados:', paths);

    found = paths[0];
  } catch (e) {
    console.log('Nenhum main.js encontrado via find.');
  }
}

if (!found) {
  console.error('ERRO: Nenhum entrypoint main.js do backend encontrado.');
  console.error('Verifique o outDir do tsc (tsconfig) e o script "build:server".');
  process.exit(1);
}

console.log('main.js selecionado:', found);

// Normaliza e remove "./" do começo, se tiver
const normalized = found.replace(/^[.][/\\\\]/, '').replace(/\\/g, '/');

// Gera entry.mjs em ESM usando import
const content = `import './${normalized}';\n`;
fs.writeFileSync('entry.mjs', content);

console.log('entry.mjs gerado apontando para:', normalized);
EOF


########################################################
# STAGE 2: Runner - imagem final de produção
########################################################
FROM node:22-alpine AS runner

WORKDIR /app

# dumb-init pra tratar bem sinais (Ctrl+C, SIGTERM etc.)
RUN apk add --no-cache dumb-init

# Copia TUDO do builder (código, node_modules, dist, server, entry.mjs, etc.)
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Roda o backend via entry.mjs (ESM)
CMD ["dumb-init", "node", "entry.mjs"]
