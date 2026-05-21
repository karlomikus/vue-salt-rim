FROM oven/bun:1-alpine AS build

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION:-develop}

WORKDIR /app
COPY package*.json ./
RUN bun install
COPY . .

RUN sed -i "s/{{VERSION}}/$BUILD_VERSION/g" ./docker/config.js

RUN bun run build

FROM docker.io/nginxinc/nginx-unprivileged:stable AS prod

LABEL org.opencontainers.image.source="https://github.com/karlomikus/vue-salt-rim"

COPY --from=build --chown=www-data:www-data /app/dist /var/www/html

COPY --from=build --chown=www-data:www-data /app/docker/config.js /var/www/config.js
COPY --chown=www-data:www-data ./docker/entrypoint.sh /usr/local/bin/entrypoint

RUN rm /etc/nginx/conf.d/default.conf
COPY --chown=www-data:www-data ./docker/default.conf /etc/nginx/conf.d/default.conf

USER www-data

EXPOSE 8080

RUN chmod +x /usr/local/bin/entrypoint

CMD [ "/usr/local/bin/entrypoint" ]

FROM oven/bun:1 AS dev

WORKDIR /app

COPY package*.json ./

RUN bun install

COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev"]
