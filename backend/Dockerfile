FROM node:22-alpine
LABEL authors="Jake Lariviere"

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN POSTGRES_PRISMA_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder npx prisma generate

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]