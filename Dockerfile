# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo
COPY . .

# --- DESATIVAÇÃO COMPLETA DO PRERENDER DE ROTAS ---
# Sobrescreve os arquivos que forçam o prerender no servidor para arrays vazios.
# Isso impede que o compilador tente adivinhar os parâmetros de :id.
RUN echo "export default [];" > src/app/app.routes.server.ts 2>/dev/null || true
RUN echo "export const serverRoutes = [];" > src/app/server.routes.ts 2>/dev/null || true

# Executa o build puro focado no navegador
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados para a pasta do Nginx
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]