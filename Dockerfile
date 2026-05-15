# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Engenharia de Software: Forçamos o build a ignorar TUDO que é servidor.
# O uso de --prerender false --ssr false DIRETAMENTE no comando build 
# é a única forma de sobrescrever o JSON quando ele está teimoso.
RUN ./node_modules/.bin/ng build --configuration production \
    --prerender false \
    --ssr false \
    --output-hashing all

# Estágio 2: Produção
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# IMPORTANTE: No Angular 17+, mesmo sem SSR, ele pode criar a pasta /browser.
# Se falhar o Step 1, mude para: /app/dist/zeron-one
COPY --from=build /app/dist/zeron-one/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]