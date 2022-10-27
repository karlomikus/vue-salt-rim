FROM node:current-alpine3.15

ENV VITE_BA_API_URL=
ENV VITE_SEARCH_URL=
ENV VITE_SEARCH_KEY=

RUN npm install -g http-server

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "http-server", "dist" ]
