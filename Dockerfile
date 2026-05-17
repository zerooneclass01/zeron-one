# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala o 'jq' para limpar o JSON
RUN apk add --no-cache jq

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo original
COPY . .

# --- EXTINÇÃO TOTAL DO ECOSSISTEMA SSR ---
# Removemos todas as chaves de ssr, prerender e server de qualquer lugar do angular.json
# Isso força o Angular a se comportar como uma SPA antiga e puramente Client-Side.
RUN if [ -f angular.json ]; then \
        jq 'del(.projects[].architect.build.options.ssr, \
                .projects[].architect.build.options.prerender, \
                .projects[].architect.build.configurations.production.ssr, \
                .projects[].architect.build.configurations.production.prerender, \
                .projects[].architect.build.configurations.production.server, \
                .projects[].architect.server)' angular.json > tmp.json && mv tmp.json angular.json; \
    fi

# Executa o build que agora só conhece o navegador
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados com segurança
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]