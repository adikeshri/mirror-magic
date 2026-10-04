# syntax=docker/dockerfile:1

# Multi-arch: builds natively on a Raspberry Pi (arm64 or armv7).
# Node 22 runs the TypeScript server directly, so there is no server build step.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    MIRROR_CONFIG=/config/config.json \
    MIRROR_CACHE_DIR=/data
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# The server shares the config schema with the client.
COPY server ./server
COPY src/mirror/config.ts ./src/mirror/config.ts
COPY package.json ./

# /config holds config.json (mounted read-only); /data holds the quote cache.
RUN mkdir -p /config /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/config',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"

CMD ["node", "server/index.ts"]
