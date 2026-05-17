# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala o 'jq' para limpar o JSON de forma cirúrgica
RUN apk add --no-cache jq

# Injeta limite de memória para o Node
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Instala dependências aproveitando o cache do Docker
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia o código completo original (restaurando seus arquivos originais)
COPY . .

# --- DESATIVAÇÃO DA CAMADA DE SERVIDOR NO ANGULAR.JSON ---
# Removemos a referência ao arquivo 'server' e desativamos o output do ecossistema SSR.
# Isso faz o Angular buildar puramente como Single Page Application (SPA).
RUN if [ -f angular.json ]; then \
        jq 'del(.projects["zeron-one"].architect.build.options.server, \
                .projects["zeron-one"].architect.build.options.ssr, \
                .projects["zeron-one"].architect.build.options.prerender, \
                .projects["zeron-one"].architect.build.configurations.production.server, \
                .projects["zeron-one"].architect.build.configurations.production.ssr, \
                .projects["zeron-one"].architect.build.configurations.production.prerender) | \
            .projects["zeron-one"].architect.build.options.outputMode = "static"' angular.json > tmp.json && mv tmp.json angular.json; \
    fi

# Executa o build clássico focado no navegador
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /usr/share/nginx/html

# Copia os arquivos gerados com segurança
RUN cp -r /app/dist/*/browser/* /usr/share/nginx/html/ || cp -r /app/dist/*/* /usr/share/nginx/html/ || cp -r /app/dist/* /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]