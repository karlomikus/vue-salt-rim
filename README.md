<p align="center">
    <a href="https://karlomikus.com" target="_blank"><img width="700" src="art/hero.png" alt="Logo"></a>
</p>

<p align="center">
    <a href="https://hub.docker.com/r/kmikus12/salt-rim"><img src="https://img.shields.io/docker/v/kmikus12/salt-rim?style=for-the-badge" alt="Docker image"></a>
    <img src="https://img.shields.io/github/license/karlomikus/vue-salt-rim?style=for-the-badge" alt="License">
    <img src="https://img.shields.io/github/workflow/status/karlomikus/vue-salt-rim/Build%20docker%20image?style=for-the-badge" alt="Build">
</p>

# 🍹 Salt Rim - Bar Assistent Web Client

Salt Rim is a web client used for connecting to your [Bar Assistant](https://github.com/karlomikus/bar-assistant) server. It's made with Vue.js and it builds to a static webpage that can be easily hosted anywhere.

## Features

- Beautiful UI for your Bar Asistant server
- Desktop and mobile support
- Search for cocktails and ingredients using [Meilisearch](https://www.meilisearch.com/) and [Vue Instantsearch](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/vue/)
- Add, update or delete cocktails and ingredients
- Manage your personal shopping lists
- Save your favorite cocktails
- Markdown support
- Automatically add missing ingredients to your shopping cart
- Implements all supported functionality of Bar Assistant

## Installation

*This steps will build Salt Rim into a static webpage.*

1. Clone the repository
2. Install the dependencies

``` bash
$ npm install
```

3. Add configuration

Create a new config file in `public/config.js`, with the following content

``` js
window.srConfig = {}
window.srConfig.API_URL = "http://YOUR_BA_API_URL"
```

4. Run the build commands

``` bash
$ npm run build
```

This will create a `dist/` folder with ready to use static files.

## Docker

Required environment variables:

|Env Key|Value|Description|Example
|-|-|-|-
|API_URL|url|URL of your Bar Assistant server|http://bar-assistant.local

Image by default exposes port `8080`

You can run docker image with the following command:

```
$ docker run -d \
    -p 8080:8080 \
    -e API_URL=http://BA_SERVER_URL \
    kmikus12/salt-rim
```

## Docker compose

Use the following `docker-compose.yml` template to get started with all services required to run Bar Assistant and Salt Rim.

``` yml
version: "3"

services:
  meilisearch:
    image: getmeili/meilisearch
    environment:
      - MEILI_MASTER_KEY=masterKey
      - MEILI_ENV=production
    ports:
      - 7700:7700
    volumes:
      - ./meilisearch:/meili_data

  bar-assistant:
    image: kmikus12/bar-assistant-server
    depends_on:
      - meilisearch
    environment:
      - APP_URL=http://YOUR_BA_API_SERVER_IP
      - MEILISEARCH_KEY=masterKey
      - MEILISEARCH_HOST=http://YOUR_MEILISEARCH_SERVER_IP
    volumes:
      - ba-storage:/var/www/cocktails/storage
    ports:
      - 8000:80

  salt-rim:
    image: kmikus12/salt-rim
    depends_on:
      - meilisearch
      - bar-assistant
    environment:
      - API_URL=http://YOUR_BA_API_SERVER_IP
    ports:
      - 8080:8080

volumes:
  ba-storage:
```

Access your Salt Rim instance at `http://<SERVER_IP>:8080`.

Login with default email and password:

```
email: admin@example.com
password: password
```

## Contributing

``` bash
# Dev server
$ npm run dev
```

## License

Salt Rim is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
