#!/bin/sh

envsubst < /var/www/config.js > /var/www/html/config.js

if [ ! -z "$ANALYTICS_SCRIPT" ]; then
    echo "Setting analytics...";
    sed -i "s/<!-- {{ANALYTICS_SCRIPT}} -->/$ANALYTICS_SCRIPT/g" ./src/main.js
fi

exec nginx -g "daemon off;"
