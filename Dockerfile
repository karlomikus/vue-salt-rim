FROM node:current-alpine3.15 as build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:current-alpine3.15 as prod

RUN npm install -g http-server

COPY --from=build /app/dist /app/dist

COPY ./entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

EXPOSE 8080

CMD [ "entrypoint" ]
