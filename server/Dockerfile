# Build Stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Production Runner Stage
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
