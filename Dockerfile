# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build limpo - o Angular agora respeita o seu angular.json estático
RUN ./node_modules/.bin/ng build --configuration production

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# Lógica de Engenharia: Garante que os arquivos cheguem na pasta do Nginx
# independente da estrutura de subpastas do Angular 17+
RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/dist/zeron-one /tmp/build/

RUN if [ -d "/tmp/build/browser" ]; then \
        cp -r /tmp/build/browser/* /usr/share/nginx/html/; \
    else \
        cp -r /tmp/build/* /usr/share/nginx/html/; \
    fi

CMD ["nginx", "-g", "daemon off;"]