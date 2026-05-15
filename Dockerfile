# Estágio de Build
FROM node:16-alpine3.16 as build
WORKDIR /app
COPY ./package*.json ./
RUN npm ci
COPY ./ ./
RUN npm run build --output-hashing=all

# Estágio de Produção
FROM nginx:1.23.0-alpine
# O Cloud Run exige a porta 8080 por padrão
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf
# Verifique o nome da pasta após o build: dist/zero-one ou dist/zeron-one?
COPY --from=build /app/dist/zeron-one /usr/share/nginx/html