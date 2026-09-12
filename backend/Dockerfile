FROM node:22-bookworm-slim AS base
ARG SEMGREP_VERSION=1.176.1
ENV SEMGREP_SEND_METRICS=off \
    SEMGREP_ENABLE_VERSION_CHECK=0 \
    PATH="/opt/semgrep/bin:${PATH}"
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv \
    && python3 -m venv /opt/semgrep \
    && /opt/semgrep/bin/pip install --no-cache-dir "semgrep==${SEMGREP_VERSION}" \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS development
COPY . .
EXPOSE 3000
CMD ["node_modules/.bin/nest", "start", "--watch"]

FROM deps AS builder
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY semgrep/rules ./semgrep/rules
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
