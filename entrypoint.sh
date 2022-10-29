#!/bin/sh

RUNTIME_CONF="
    window.srConfig = {}
    window.srConfig.API_URL = \"$API_URL\"
    window.srConfig.SEARCH_URL = \"$SEARCH_URL\"
    window.srConfig.SEARCH_KEY = \"$SEARCH_KEY\"
"
echo $RUNTIME_CONF > dist/config.js

exec http-server dist/
