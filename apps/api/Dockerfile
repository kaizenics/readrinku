# Standalone @rinku/api image for a self-hosted VPS (Coolify / Docker / etc.).
#
# IMPORTANT: the build context must be the REPO ROOT (this is a pnpm monorepo).
# In Coolify set:
#   Build Pack:          Dockerfile
#   Dockerfile Location: apps/api/Dockerfile
#   Base Directory:      /        (repo root)
FROM node:22-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="/pnpm:$PATH"
RUN corepack enable

WORKDIR /app

# Copy workspace manifests first so Docker caches the install layer (it only
# re-runs when a package.json / lockfile changes).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/core/package.json ./packages/core/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

# Install only the API and its workspace deps (@rinku/core). tsx (which runs the
# server) is a devDependency, so install BEFORE setting NODE_ENV=production.
RUN pnpm install --filter @rinku/api... --frozen-lockfile

# App source.
COPY packages/core ./packages/core
COPY apps/api ./apps/api

ENV NODE_ENV=production
# The app listens on $PORT (default 3001); Coolify's proxy maps to this port.
ENV PORT=3001
EXPOSE 3001

WORKDIR /app/apps/api
CMD ["pnpm", "start"]
