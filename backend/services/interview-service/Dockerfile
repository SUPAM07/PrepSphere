FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/interview-service/package*.json ./services/interview-service/
RUN cd services/interview-service && npm install

COPY services/interview-service ./services/interview-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/interview-service

RUN npx tsc

EXPOSE 8002

CMD [ "node", "dist/services/interview-service/index.js" ]