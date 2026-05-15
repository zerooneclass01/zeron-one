# Estágio 1: Build (Agrupando comandos para reduzir camadas)
FROM node:16-alpine3.16 as build

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./
RUN npm ci

# Copia o restante dos arquivos
COPY . .

# Executa o build. 
# IMPORTANTE: Verifique se o nome da pasta gerada em /dist é exatamente 'zeron-one'
RUN npm run build -- --output-hashing=all

# Estágio 2: Produção (Servidor Nginx)
FROM nginx:1.23.0-alpine

# Configuração de porta para o Cloud Run
EXPOSE 8080

# Copia a configuração do Nginx que você já corrigiu
COPY nginx.conf /etc/nginx/nginx.conf

# Copia os arquivos compilados do estágio anterior
# DICA: Se der erro de "folder not found", verifique o nome da pasta dentro de /dist
COPY --from=build /app/dist/zeron-one /usr/share/nginx/html

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]