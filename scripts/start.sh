#!/bin/sh
set -e

echo "🔄 Executando migrações do banco de dados..."
npx prisma migrate deploy

echo "✅ Migrações concluídas!"
echo "🚀 Iniciando aplicação..."

exec dumb-init tsx server/src/main.ts
