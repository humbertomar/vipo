# ===========================
# STAGE 1 - BUILDER
# ===========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

RUN npm install -g pnpm && \
    pnpm install --no-frozen-lockfile

RUN npx prisma generate

COPY . .

RUN pnpm run build
# (npm run build:client && npm run build:server)

# ===========================
# STAGE 2 - RUNTIME
# ===========================
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY patches ./patches
COPY prisma ./prisma

RUN npm install -g pnpm && \
    pnpm install --prod --no-frozen-lockfile

RUN npx prisma@6.19.1 generate

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

CMD ["dumb-init", "node", "dist/server/src/main.js"]
