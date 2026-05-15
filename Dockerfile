# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Adiciona sed para limpeza de arquivos
RUN apk add --no-cache sed

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# --- LIMPEZA DE ENGENHARIA ---
# 1. Força o modo estático
RUN sed -i 's/"outputMode": "server"/"outputMode": "static"/g' angular.json
# 2. Desativa explicitamente o prerender no arquivo (muda true para false)
RUN sed -i 's/"prerender": true/"prerender": false/g' angular.json
# 3. Desativa explicitamente o ssr no arquivo
RUN sed -i 's/"ssr": true/"ssr": false/g' angular.json

# Build limpo - Sem as flags extras para não confundir o CLI que já foi "limpo" pelo sed
RUN ./node_modules/.bin/ng build --configuration production

# Estágio 2: Produção
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# O Angular 17+ em modo static gera os arquivos em /dist/zeron-one/browser
# Usamos um wildcard (*) para garantir que pegamos os arquivos onde quer que eles caiam
COPY --from=build /app/dist/zeron-one/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]