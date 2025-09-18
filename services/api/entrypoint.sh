#!/bin/sh
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting API..."
exec npm run build && exec node dist/index.js