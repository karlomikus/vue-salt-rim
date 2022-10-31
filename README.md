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
window.srConfig.MEILISEARCH_HOST = "YOUR_MEILISEARCH_URL"
```

4. Run the build commands

``` bash
$ npm run build
```

This will create a `dist/` folder with ready to use static files.

## Docker compose

    NOTE: Docker configuration for salt rim and bar assistant is still WIP, so anything can and will break.

Use the following `docker-compose.yml` template to get started with all required services.

With this setup you can access application by visiting `http://localhost:8080`.

Default email and password:

```
email: admin@example.com
password: password
```

``` yml
version: "3"

services:
  meilisearch:
    image: getmeili/meilisearch
    environment:
      - MEILI_MASTER_KEY=JwBO9HU24uBj0MQPonm5Ui8I8wBkKFwj6pjwkPZ2YjYzWIcyZu
      - MEILI_ENV=production
    ports:
      - 7700:7700
    volumes:
      - ./meilisearch:/meili_data

  bar-assistant:
    depends_on:
      - meilisearch
    image: kmikus12/bar-assistant-server
    environment:
      - APP_URL=http://localhost:8000
      - MEILISEARCH_KEY=JwBO9HU24uBj0MQPonm5Ui8I8wBkKFwj6pjwkPZ2YjYzWIcyZu
      - MEILISEARCH_HOST=http://meilisearch:7700
    ports:
      - 8000:80

  salt-rim:
    depends_on:
      - meilisearch
      - bar-assistant
    image: kmikus12/salt-rim
    environment:
      - API_URL=http://localhost:8000
      - SEARCH_URL=http://localhost:7700
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
