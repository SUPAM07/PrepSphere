FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/roadmap-service/package*.json ./services/roadmap-service/
RUN cd services/roadmap-service && npm install

COPY services/roadmap-service ./services/roadmap-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/roadmap-service

RUN npx tsc

EXPOSE 8003

CMD [ "node", "dist/services/roadmap-service/index.js" ]