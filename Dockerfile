FROM node:latest-alpine

RUN mkdir -p /home/node/vue-cocktail/node_modules && chown -R node:node /home/node/vue-cocktail

WORKDIR /home/node/vue-cocktail

COPY --chown=node:node . .

USER node

RUN npm install

RUN npm run build
