FROM node:current-alpine3.15 as build

ARG BUILD_VERSION
ENV BUILD_VERSION=${BUILD_VERSION:-develop}
ARG ANALYTICS_SCRIPT=""
ENV ANALYTICS_SCRIPT=${ANALYTICS_SCRIPT}
ARG APP_ENV="production"
ENV APP_ENV=${APP_ENV}

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

RUN sed -i "s/{{VERSION}}/$BUILD_VERSION/g" ./docker/config.js

RUN npm run build

FROM nginx as prod

COPY --from=build /app/dist /var/www/html

COPY --from=build /app/docker/config.js /var/www/config.js
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint

RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 8080

CMD [ "entrypoint" ]
