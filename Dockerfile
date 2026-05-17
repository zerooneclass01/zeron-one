# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo original (sem alterar nenhum arquivo .ts)
COPY . .

# --- O PULO DO GATO ---
# Forçamos o Angular CLI a buildar estritamente para o navegador (SPA), 
# desativando SSR, Prerender e forçando o output clássico que o Nginx precisa.
RUN npx ng build --configuration production \
    --ssr false \
    --prerender false \
    --output-mode static \
    --optimization true

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados com segurança
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]