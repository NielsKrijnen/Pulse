FROM node:20
WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

RUN npm run build

COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh
CMD ["/wait-for-db.sh"]