ARG BUN_VERSION=1.2.23
ARG NODE_VERSION=24.15.0

FROM oven/bun:${BUN_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:${BUN_VERSION}-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock tsconfig.json tsconfig.build.json tsdown.config.ts ./
COPY src ./src
RUN bun run build

FROM oven/bun:${BUN_VERSION}-alpine AS prod-deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts --production

FROM node:${NODE_VERSION}-alpine AS runtime
ARG PORT=5500
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=${PORT}
WORKDIR /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then((response)=>process.exit(response.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
