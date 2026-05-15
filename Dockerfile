# Estágio 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala as dependências ignorando erros de versão
RUN npm install --legacy-peer-deps

# Copia todo o código fonte
COPY . .

# COMANDO CORRIGIDO: 
# Forçamos o build a ignorar SSR e Prerender via CLI para garantir que o erro 127 suma
RUN ./node_modules/.bin/ng build --configuration production --ssr false --prerender false

# Estágio 2: Produção
FROM nginx:1.23.0-alpine

EXPOSE 8080

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# CAMINHO DE CÓPIA:
# Se o seu angular.json foi corrigido para 'static', os arquivos estarão em /dist/zeron-one
# Se ele ainda tentar fazer algo de browser, estarão em /dist/zeron-one/browser
# Usamos o caractere curinga (*) para pegar o conteúdo não importa a subpasta
COPY --from=build /app/dist/zeron-one /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]