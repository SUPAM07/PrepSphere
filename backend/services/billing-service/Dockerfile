FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/billing-service/package*.json ./services/billing-service/
RUN cd services/billing-service && npm install

COPY services/billing-service ./services/billing-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/billing-service

RUN apt-get update && apt-get install -y python3 make g++

RUN npx tsc

EXPOSE 8005

# IMPROVEMENT 2: Run Drizzle migrations automatically before starting the server.
# This ensures the DB schema is always up-to-date on every container boot.
CMD ["sh", "-c", "node dist/services/billing-service/db/migrate.js && node dist/services/billing-service/index.js"]
