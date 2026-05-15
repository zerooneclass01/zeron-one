# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o código e executa o build
COPY . .
RUN ./node_modules/.bin/ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# IMPORTANTE: No modo static, o Angular gera os arquivos em /dist/zeron-one/browser
# Se o deploy falhar nesta linha, verifique se a pasta é apenas /dist/zeron-one
COPY --from=build /app/dist/zeron-one/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]