# Estágio 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Estágio 2: Runtime
FROM nginx:stable-alpine
# Copia o seu config customizado para o Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia o build (ajuste o caminho da dist/ conforme seu projeto)
COPY --from=build /app/dist/seu-projeto/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]