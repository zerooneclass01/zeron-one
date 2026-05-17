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

# Executa o build (gera os arquivos)
RUN npx ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080

# Remove a configuração padrão do Nginx Alpine para evitar conflitos
RUN rm /etc/nginx/conf.d/default.conf || true

# Copia o seu arquivo nginx.conf customizado
COPY nginx.conf /etc/nginx/nginx.conf

# Limpa e garante a existência da pasta destino
RUN rm -rf /usr/share/nginx/html/* && mkdir -p /usr/share/nginx/html

# --- CORREÇÃO DO COPIADOR CROWD-SAFETY ---
# Copia o conteúdo tentando pegar da pasta raiz do projeto OU de dentro da subpasta browser (se ela existir)
COPY --from=build /app/dist/zeron-one/ /usr/share/nginx/html/
RUN if [ -d /usr/share/nginx/html/browser ]; then cp -r /usr/share/nginx/html/browser/* /usr/share/nginx/html/ && rm -rf /usr/share/nginx/html/browser; fi

# --- CORREÇÃO DE PERMISSÃO (FIM DO 403) ---
# Garante que o Nginx tenha direito de ler a pasta e todos os arquivos do Angular
RUN chmod -R 755 /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]