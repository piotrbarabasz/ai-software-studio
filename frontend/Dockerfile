FROM node:20-bookworm-slim AS build

ARG API_URL=http://127.0.0.1:8000

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN printf "export const environment = {\n  production: true,\n  apiUrl: '%s',\n} as const;\n" "$API_URL" > src/environments/environment.prod.ts \
    && npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-security-headers.conf /etc/nginx/security-headers.conf

RUN nginx -t

COPY --from=build /app/dist/aisoftware-studio/browser /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
