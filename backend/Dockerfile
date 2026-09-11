FROM node:22-alpine
LABEL authors="Jake Lariviere"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]