#!/bin/sh

RUNTIME_ENV_CONFIG="
    window.srConfig = {};
    window.srConfig.API_URL = \"$API_URL\";
    window.srConfig.SEARCH_URL = \"$SEARCH_URL\";
    window.srConfig.SEARCH_KEY = \"$SEARCH_KEY\";
"
echo $RUNTIME_ENV_CONFIG > dist/config.js
echo $RUNTIME_ENV_CONFIG > public/config.js

exec http-server dist/ -c-1 --proxy http://localhost:8080?
