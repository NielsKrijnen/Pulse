FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN apt-get update && apt-get install -y git docker.io && rm -rf /var/lib/apt/lists/*

RUN npm run build
CMD ["node", "dist/index.js"]