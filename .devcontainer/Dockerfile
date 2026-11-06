FROM mcr.microsoft.com/devcontainers/typescript-node:1-24-bookworm

COPY --from=ghcr.io/astral-sh/uv:0.13.5 /uv /uvx /usr/local/bin/

RUN corepack enable \
    && corepack prepare pnpm@12.18.0 --activate

USER node

