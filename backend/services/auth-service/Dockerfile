# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY ./services/auth-service/package*.json ./services/auth-service/
RUN cd services/auth-service && npm ci

COPY services/auth-service ./services/auth-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/auth-service
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./services/auth-service/package*.json ./services/auth-service/
RUN cd services/auth-service && npm ci --omit=dev

RUN apk del python3 make g++

COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist

WORKDIR /app/services/auth-service
EXPOSE 8001

CMD ["sh", "-c", "node dist/services/auth-service/db/migrate.js && node dist/services/auth-service/index.js"]
