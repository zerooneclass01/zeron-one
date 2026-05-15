# Estágio 1: Build 
# Alterado para Node 18 (mais estável para Angular moderno)
FROM node:18-alpine as build

WORKDIR /app

# Copia arquivos de configuração primeiro
COPY package*.json ./

# Instala dependências (npm ci é melhor para CI/CD)
RUN npm ci

# Copia todo o projeto
COPY . .

# Aumentamos a memória do Node para evitar o erro status 3
# O comando 'ng build' é chamado diretamente
RUN node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build --configuration production

# Estágio 2: Produção
FROM nginx:1.23.0-alpine

EXPOSE 8080

# Copia o seu nginx.conf corrigido
COPY nginx.conf /etc/nginx/nginx.conf

# IMPORTANTE: Verifique se o nome da pasta em dist é 'zeron-one' ou 'zero-one'
# Se o build falhar aqui, mude o nome da pasta abaixo
COPY --from=build /app/dist/zeron-one /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]