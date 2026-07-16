FROM node:20-bookworm-slim AS build

ARG API_URL=__PUBLIC_CONFIG_REQUIRED__:apiUrl
ARG PUBLIC_SITE_ORIGIN=__PUBLIC_CONFIG_REQUIRED__:publicSiteOrigin

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN API_URL="$API_URL" PUBLIC_SITE_ORIGIN="$PUBLIC_SITE_ORIGIN" node scripts/write-production-environment.cjs \
    && npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-security-headers.conf /etc/nginx/security-headers.conf

RUN nginx -t

COPY --from=build /app/dist/aisoftware-studio/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
