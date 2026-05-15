# Estágio 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# 1. Copia dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 2. Copia o código fonte
COPY . .

# 3. Build simplificado (o Angular lerá as configurações do seu angular.json)
# Removi as flags que causaram o erro 127
RUN ./node_modules/.bin/ng build --configuration production

# Estágio 2: Produção
FROM nginx:1.23.0-alpine

# Porta para o Cloud Run
EXPOSE 8080

# Configuração do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 4. AJUSTE DE CAMINHO (Ponto Crítico)
# Em versões novas do Angular, os arquivos ficam em: /dist/nome-do-projeto/browser
# Se o build der erro de "folder not found" nesta linha, mude para: /app/dist/zeron-one
COPY --from=build /app/dist/zeron-one/browser /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]