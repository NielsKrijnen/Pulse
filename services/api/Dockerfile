FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]