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

# Remove o ecossistema SSR para compilar como SPA pura
RUN if [ -f angular.json ]; then \
        jq 'del(.projects["zeron-one"].architect.build.options.server, \
                .projects["zeron-one"].architect.build.options.ssr, \
                .projects["zeron-one"].architect.build.options.prerender, \
                .projects["zeron-one"].architect.build.configurations.production.server, \
                .projects["zeron-one"].architect.build.configurations.production.ssr, \
                .projects["zeron-one"].architect.build.configurations.production.prerender) | \
            .projects["zeron-one"].architect.build.options.outputMode = "static"' angular.json > tmp.json && mv tmp.json angular.json; \
    fi

# Executa o build (gera os arquivos em /app/dist/zeron-one)
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# Cria a pasta do HTML do Nginx se não existir
RUN mkdir -p /usr/share/nginx/html

# AQUI ESTÁ O SEGREDO: Copia os arquivos gerados no estágio "build" para o Nginx
COPY --from=build /app/dist/zeron-one/ /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]