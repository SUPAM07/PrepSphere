FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/resume-service/package*.json ./services/resume-service/
RUN cd services/resume-service && npm install

COPY services/resume-service ./services/resume-service
COPY shared ./shared
COPY tsconfig.base.json ./

WORKDIR /app/services/resume-service

RUN npx tsc

EXPOSE 8004

CMD [ "node", "dist/services/resume-service/index.js" ]