FROM node:24-bookworm-slim AS build

WORKDIR /app
ARG DATABASE_URL=postgresql://nookfolio:build-only@postgres:5432/nookfolio?schema=public
ENV DATABASE_URL=${DATABASE_URL}
RUN apt-get update \
  && apt-get install --no-install-recommends -y openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@11.15.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec nuxt prepare && pnpm prisma:generate && pnpm build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install --no-install-recommends -y openssl \
  && rm -rf /var/lib/apt/lists/*

RUN useradd --system --uid 10001 --create-home nookfolio \
  && mkdir -p /srv/nookfolio/data/uploads /srv/nookfolio/data/geo \
  && chown -R nookfolio:nookfolio /srv/nookfolio

COPY --chown=nookfolio:nookfolio --from=build /app/node_modules ./node_modules
COPY --chown=nookfolio:nookfolio --from=build /app/package.json ./package.json
COPY --chown=nookfolio:nookfolio --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=nookfolio:nookfolio --from=build /app/prisma7.config.ts ./prisma7.config.ts
COPY --chown=nookfolio:nookfolio --from=build /app/prisma ./prisma
COPY --chown=nookfolio:nookfolio --from=build /app/server/generated ./server/generated
COPY --chown=nookfolio:nookfolio --from=build /app/server/services ./server/services
COPY --chown=nookfolio:nookfolio --from=build /app/server/utils ./server/utils
COPY --chown=nookfolio:nookfolio --from=build /app/shared ./shared
COPY --chown=nookfolio:nookfolio --from=build /app/scripts/remove-footprint-media.mjs ./scripts/remove-footprint-media.mjs
COPY --chown=nookfolio:nookfolio --from=build /app/scripts/site-init.ts ./scripts/site-init.ts
COPY --chown=nookfolio:nookfolio --from=build /app/.output ./.output
COPY --chmod=755 docker/app-entrypoint.sh /usr/local/bin/nookfolio-entrypoint

USER nookfolio
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/nookfolio-entrypoint"]
