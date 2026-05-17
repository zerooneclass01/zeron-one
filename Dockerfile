# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo (sem apagar os arquivos .ts do server)
COPY . .

# Build desativando explicitamente o prerender e o mapeamento de rotas do servidor
RUN npx ng build --configuration production --prerender false --ssr false --output-mode browser

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos estáticos gerados para o Nginx
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]