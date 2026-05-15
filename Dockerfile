# Estágio 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Instala ferramentas básicas de edição de texto (sed)
RUN apk add --no-cache sed

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# --- O PULO DO GATO ---
# Esse comando substitui "server" por "static" dentro do angular.json via linha de comando
# Isso remove a exigência do "ssr.entry" que está quebrando o seu build
RUN sed -i 's/"outputMode": "server"/"outputMode": "static"/g' angular.json

# Agora o build vai rodar sem procurar por arquivos de servidor
RUN ./node_modules/.bin/ng build --configuration production

# Estágio 2: Produção
FROM nginx:1.23.0-alpine

EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# Verificação de pasta: no modo static, o Angular costuma colocar em /dist/zeron-one
# Se o deploy falhar nesta linha, tente remover o /browser do final
COPY --from=build /app/dist/zeron-one/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]