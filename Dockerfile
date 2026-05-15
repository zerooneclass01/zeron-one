# Estágio 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copia apenas os arquivos de configuração
COPY package*.json ./

# Instala as dependências (ignora conflitos de versão que causam erro 1)
RUN npm install --legacy-peer-deps

# Copia o resto do código
COPY . .

# Executa o build (Aumentamos a memória e usamos o npx para maior estabilidade)
RUN node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build --configuration production --no-prerender --no-ssr

# Estágio 2: Produção
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# IMPORTANTE: Verifique se a pasta em dist/ é exatamente 'zeron-one'
# Se o erro persistir aqui, tente mudar para /app/dist/
COPY --from=build /app/dist/zeron-one /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]