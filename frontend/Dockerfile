# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS build

ARG API_URL=__PUBLIC_CONFIG_REQUIRED__:apiUrl
ARG PUBLIC_SITE_URL=__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl
ARG PUBLIC_SITE_INDEXING=false

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN --mount=type=secret,id=public_legal_config,required=true \
    API_URL="$API_URL" PUBLIC_SITE_URL="$PUBLIC_SITE_URL" \
    PUBLIC_SITE_INDEXING="$PUBLIC_SITE_INDEXING" \
    PUBLIC_LEGAL_CONFIG_PATH=/run/secrets/public_legal_config npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/generated/nginx-security-headers.conf /etc/nginx/security-headers.conf
COPY docker-entrypoint.d/40-validate-legal-artifact.sh /docker-entrypoint.d/40-validate-legal-artifact.sh

RUN chmod 755 /docker-entrypoint.d/40-validate-legal-artifact.sh && nginx -t

COPY --from=build /app/dist/aisoftware-studio/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
