# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Injeta limite de memória para o Node não travar o Cloud Build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache de camadas do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código (Garante que você tem o .dockerignore para não levar o node_modules local!)
COPY . .

# Remove arquivos de servidor para garantir build estático
RUN rm -f src/main.server.ts src/server.ts

# Build utilizando o binário global do ambiente ou npx (evita caminhos relativos quebrados)
RUN npx ng build --configuration production --ssr false --prerender false

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Ajuste dinâmico: procura a pasta 'browser' dentro de QUALQUER subpasta gerada em dist/
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]