# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala o 'jq' para podermos manipular o angular.json dinamicamente
RUN apk add --no-cache jq

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo original
COPY . .

# --- DESATIVAÇÃO CIRÚRGICA DE SSR/PRERENDER NO ANGULAR.JSON ---
# Este comando remove as seções "server", "ssr" e "prerender" do build de produção,
# limpando qualquer rastro de configuração que force o prerender das rotas.
RUN if [ -f angular.json ]; then \
        jq '.projects | to_entries[0].value.architect.build.configurations.production |= del(.ssr, .prerender, .server, .outputMode)' angular.json > tmp.json && mv tmp.json angular.json; \
    fi

# Agora o build roda limpo como uma Single Page Application (SPA) clássica
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados com segurança (com ou sem a pasta /browser)
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]