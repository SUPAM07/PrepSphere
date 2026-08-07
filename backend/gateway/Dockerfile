# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY ./gateway/package*.json ./gateway/
RUN cd gateway && npm ci

COPY gateway ./gateway
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/gateway
RUN npx tsc

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY ./gateway/package*.json ./gateway/
RUN cd gateway && npm ci --omit=dev

COPY --from=builder /app/gateway/dist ./dist

EXPOSE 8000

CMD ["node", "dist/gateway/index.js"]
