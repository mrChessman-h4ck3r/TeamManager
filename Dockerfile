FROM node:22-alpine

# Build tools for native modules (bcrypt, better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Data directory for SQLite (ephemeral on free Render unless you add a disk)
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 3000

# Render sets PORT; seed admin then start
CMD ["sh", "-c", "node seed.js && node server.js"]
