<p align="center">
    <a href="https://karlomikus.com" target="_blank"><img width="700" src="art/hero.png" alt="Logo"></a>
</p>

<p align="center">
    <a href="https://hub.docker.com/r/kmikus12/salt-rim"><img src="https://img.shields.io/docker/v/kmikus12/salt-rim?style=for-the-badge" alt="Docker image"></a>
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

1. Clone the repository
2. Install the dependencies

``` bash
$ npm install
```

3. Add configuration

Create a new config file in `public/config.js`, with the following content

``` js
window.srConfig = {}
window.srConfig.API_URL = "YOUR_BA_API_URL"
window.srConfig.SEARCH_URL = "MEILISEARCH_URL"
window.srConfig.SEARCH_KEY = "MEILISEARCH_API_KEY"
```

4. Run the build commands

``` bash
$ npm run build
```

This will create a `dist/` folder with ready to use static files.

## Docker

Note: Currenty WIP but it should work

[Docker image](https://hub.docker.com/r/kmikus12/salt-rim)

``` bash
$ docker run --name kmikus12/salt-rim:latest -p 8080:8080 --env-file .env salt-rim
```

Required ENV variables:

``` env
# Bar assistant API url
API_URL=
# Meilisearch url
SEARCH_URL=
# Meilisearch API key
SEARCH_KEY=
```

## Docker compose

Use the following `docker-compose.yml` template to get started with all required services

``` yml
version: "3"

services:
  meilisearch:
    container_name: ba-meilisearch
    image: getmeili/meilisearch
    environment:
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - MEILI_ENV=production
    ports:
      - 7777:7700
    volumes:
      - ./meilisearch:/meili_data

  bar-assistant:
    depends_on:
      - meilisearch
    container_name: bar-assistant
    image: kmikus12/bar-assistant-server
    environment:
      - APP_URL=${BAR_ASSISTANT_URL}
      - MEILISEARCH_KEY=${MEILI_MASTER_KEY}
      - MEILISEARCH_HOST=http://meilisearch:7700
    ports:
      - 8000:80

  salt-rim:
    depends_on:
      - meilisearch
      - bar-assistant
    container_name: salt-rim
    image: kmikus12/salt-rim
    environment:
      - API_URL=${BAR_ASSISTANT_URL}
      - SEARCH_URL=${MEILISEARCH_URL}
      - SEARCH_KEY=${MEILI_MASTER_KEY}
    ports:
      - 8080:8080
```

## Contributing

``` bash
# Dev server
$ npm run dev
```

## License

Salt Rim is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
