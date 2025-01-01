FROM node:current-alpine3.20 AS build

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION:-develop}

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

RUN sed -i "s/{{VERSION}}/$BUILD_VERSION/g" ./docker/config.js

RUN npm run build

FROM nginx AS prod

LABEL org.opencontainers.image.source="https://github.com/karlomikus/vue-salt-rim"

COPY --from=build /app/dist /var/www/html

COPY --from=build /app/docker/config.js /var/www/config.js
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint

RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 8080

CMD [ "entrypoint" ]