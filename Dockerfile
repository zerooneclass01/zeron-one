# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala ferramentas e limpa cache do npm
RUN apk add --no-cache sed
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Engenharia Reversa: Forçamos o angular.json a ser estático E desativamos Prerender/SSR
# O sed limpa a configuração de servidor, e as flags no build garantem o sucesso.
RUN sed -i 's/"outputMode": "server"/"outputMode": "static"/g' angular.json

# O segredo está nestas 3 flags: --prerender false --ssr false --output-path
RUN ./node_modules/.bin/ng build --configuration production --prerender false --ssr false

# Estágio 2: Produção
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# Como forçamos o modo static, os arquivos estarão nesta pasta:
COPY --from=build /app/dist/zeron-one/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]