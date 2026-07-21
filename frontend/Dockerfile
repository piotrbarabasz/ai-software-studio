# syntax=docker/dockerfile:1
FROM node:22.22.3-bookworm-slim AS build

ARG API_URL=__PUBLIC_CONFIG_REQUIRED__:apiUrl
ARG PUBLIC_SITE_URL=__PUBLIC_CONFIG_REQUIRED__:publicSiteUrl
ARG PUBLIC_SITE_INDEXING=false
ARG PUBLIC_SALES_EMAIL=__PUBLIC_CONFIG_REQUIRED__:publicSalesEmail
ARG PUBLIC_PRIVACY_EMAIL=__PUBLIC_CONFIG_REQUIRED__:publicPrivacyEmail
ARG PUBLIC_BUILD_SHA=unknown

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
COPY infra/gcp/production-contract.json ./production-contract.json

RUN --mount=type=secret,id=public_legal_config,required=true \
    API_URL="$API_URL" PUBLIC_SITE_URL="$PUBLIC_SITE_URL" \
    PUBLIC_SITE_INDEXING="$PUBLIC_SITE_INDEXING" \
    PUBLIC_SALES_EMAIL="$PUBLIC_SALES_EMAIL" \
    PUBLIC_PRIVACY_EMAIL="$PUBLIC_PRIVACY_EMAIL" \
    PUBLIC_BUILD_SHA="$PUBLIC_BUILD_SHA" \
    PUBLIC_LEGAL_CONFIG_PATH=/run/secrets/public_legal_config npm run build

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/generated/nginx-security-headers.conf /etc/nginx/security-headers.conf
COPY frontend/docker-entrypoint.d/40-validate-legal-artifact.sh /docker-entrypoint.d/40-validate-legal-artifact.sh

RUN chmod 755 /docker-entrypoint.d/40-validate-legal-artifact.sh && nginx -t

COPY --from=build /app/dist/aisoftware-studio/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
