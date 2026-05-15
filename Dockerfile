# Estágio 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o código
COPY . .

# --- AÇÃO DE ENGENHARIA CRÍTICA ---
# Removemos os arquivos de servidor e prerender para que o compilador 
# não tenha outra opção a não ser fazer um build 100% estático.
RUN rm -f src/main.server.ts src/server.ts

# Build forçando a desativação de tudo que é SSR
RUN ./node_modules/.bin/ng build --configuration production --ssr false --prerender false

# Estágio 2: Produção com Nginx
FROM nginx:1.23.0-alpine
EXPOSE 8080
COPY nginx.conf /etc/nginx/nginx.conf

# O Angular colocará os arquivos em /browser. Vamos copiar com segurança.
RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/dist/zeron-one /tmp/build/
RUN if [ -d "/tmp/build/browser" ]; then \
        cp -r /tmp/build/browser/* /usr/share/nginx/html/; \
    else \
        cp -r /tmp/build/* /usr/share/nginx/html/; \
    fi

CMD ["nginx", "-g", "daemon off;"]