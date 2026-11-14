FROM node:22-slim

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY patient-portal/package.json ./patient-portal/package.json

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/bundle.mjs"]
