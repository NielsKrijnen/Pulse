#!/bin/sh
sleep 5

npm run prisma:deploy
npm run prisma:generate
npm run dev