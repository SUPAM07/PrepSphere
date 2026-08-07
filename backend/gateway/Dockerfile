FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./gateway/package*.json ./gateway/
RUN cd gateway && npm install

COPY gateway ./gateway
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/gateway

RUN npx tsc

EXPOSE 8000

CMD [ "node", "dist/gateway/index.js" ]
