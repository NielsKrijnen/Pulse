FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

RUN npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]