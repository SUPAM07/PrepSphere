# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY ./services/billing-service/package*.json ./services/billing-service/
RUN cd services/billing-service && npm ci

COPY services/billing-service ./services/billing-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/billing-service
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./services/billing-service/package*.json ./services/billing-service/
RUN cd services/billing-service && npm ci --omit=dev

RUN apk del python3 make g++

COPY --from=builder /app/services/billing-service/dist ./services/billing-service/dist
COPY --from=builder /app/shared ./shared

WORKDIR /app/services/billing-service
EXPOSE 8005

CMD ["sh", "-c", "node dist/services/billing-service/db/migrate.js && node dist/services/billing-service/index.js"]
