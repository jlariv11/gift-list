FROM node:22-alpine
LABEL authors="Jake Lariviere"

RUN apk add --no-cache ca-certificates curl

RUN curl -fsSL \
    https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem \
    -o /etc/ssl/certs/rds-global-bundle.pem

ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/rds-global-bundle.pem

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN POSTGRES_PRISMA_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder npx prisma generate

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]