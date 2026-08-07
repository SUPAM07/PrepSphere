# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./services/resume-service/package*.json ./services/resume-service/
RUN cd services/resume-service && npm ci

COPY services/resume-service ./services/resume-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/resume-service
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./services/resume-service/package*.json ./services/resume-service/
RUN cd services/resume-service && npm ci --omit=dev

COPY --from=builder /app/services/resume-service/dist ./services/resume-service/dist
COPY --from=builder /app/shared ./shared

WORKDIR /app/services/resume-service
EXPOSE 8004

CMD ["node", "dist/services/resume-service/index.js"]