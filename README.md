<p align="center">
    <a href="https://karlomikus.com" target="_blank"><img width="700" src="art/hero.png" alt="Logo"></a>
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

[Docker image](https://hub.docker.com/r/kmikus12/salt-rim)

``` bash
# Dev server
$ npm run dev

# Build for prod
$ npm run build
```

``` bash
$ docker run --name salt-rim -p 8080:8080 --env-file .env salt-rim
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

Use the following docker compose template to get started with all required services

```
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

TODO

## License

Salt Rim is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
