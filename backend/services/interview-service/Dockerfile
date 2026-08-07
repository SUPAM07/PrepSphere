# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./services/interview-service/package*.json ./services/interview-service/
RUN cd services/interview-service && npm ci

COPY services/interview-service ./services/interview-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/interview-service
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./services/interview-service/package*.json ./services/interview-service/
RUN cd services/interview-service && npm ci --omit=dev

COPY --from=builder /app/services/interview-service/dist ./services/interview-service/dist
COPY --from=builder /app/shared ./shared

WORKDIR /app/services/interview-service
EXPOSE 8002

CMD ["node", "dist/services/interview-service/index.js"]