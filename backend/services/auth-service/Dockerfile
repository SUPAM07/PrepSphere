FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json ./
RUN npm install

COPY ./services/auth-service/package*.json ./services/auth-service/
RUN cd services/auth-service && npm install

COPY services/auth-service ./services/auth-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/auth-service

RUN npx tsc
EXPOSE 8001

CMD ["sh", "-c", "node dist/services/auth-service/db/migrate.js && node dist/services/auth-service/index.js"]
