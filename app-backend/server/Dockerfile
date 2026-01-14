# ===============================
#   1.  BUILD STAGE
# ===============================

FROM node:22.13.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY *.ts ./
COPY .env ./

RUN npm run build

# ===============================
#   2.  RUNTIME STAGE
# ===============================
FROM node:22.13.0-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./dist/

EXPOSE 3000

CMD ["node", "dist/server.js"]