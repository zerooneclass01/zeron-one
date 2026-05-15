# Estágio 1: Build
# Usando Node 20 LTS para garantir compatibilidade total
FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de configuração
COPY package.json package-lock.json ./

# Instala dependências usando flags de compatibilidade
RUN npm install --legacy-peer-deps

# Copia todo o código fonte
COPY . .

# Comando de Build com npx e aumento de memória
# O npx garante que o Angular CLI local seja usado
RUN node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build --configuration production

# Estágio 2: Produção (Servidor Nginx)
FROM nginx:1.23.0-alpine

EXPOSE 8080

COPY nginx.conf /etc/nginx/nginx.conf

# IMPORTANTE: No seu VS Code vi "ZERON-ONE". 
# Verifique se a pasta em dist/ é exatamente 'zeron-one'
COPY --from=build /app/dist/zeron-one /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]