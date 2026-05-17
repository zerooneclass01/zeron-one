# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala o 'jq' para podermos alterar o angular.json com precisão
RUN apk add --no-cache jq

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo original
COPY . .

# --- DESTRUIÇÃO CIRÚRGICA DO SSR PARA O PROJETO ZERON-ONE ---
# Modificamos diretamente o bloco de produção do seu projeto tirando os gatilhos de servidor
RUN if [ -f angular.json ]; then \
        jq '.projects["zeron-one"].architect.build.configurations.production |= del(.ssr, .prerender, .server, .outputMode)' angular.json > tmp.json && mv tmp.json angular.json; \
    fi

# Agora o build roda limpo como uma Single Page Application (SPA) clássica
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados com segurança
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]