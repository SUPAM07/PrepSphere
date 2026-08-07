# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./services/roadmap-service/package*.json ./services/roadmap-service/
RUN cd services/roadmap-service && npm ci

COPY services/roadmap-service ./services/roadmap-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/roadmap-service
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./services/roadmap-service/package*.json ./services/roadmap-service/
RUN cd services/roadmap-service && npm ci --omit=dev

COPY --from=builder /app/services/roadmap-service/dist ./services/roadmap-service/dist
COPY --from=builder /app/shared ./shared

WORKDIR /app/services/roadmap-service
EXPOSE 8003

CMD ["node", "dist/services/roadmap-service/index.js"]