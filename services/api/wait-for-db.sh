#!/bin/sh
until nc -z db 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting API..."
exec node dist/index.js