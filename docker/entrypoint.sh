#!/bin/sh

envsubst < /var/www/config.js > /var/www/html/config.js

replacement = "$ANALYTICS_SCRIPT"

sed -i "s/<!-- ANALYTICS -->/$replacement/g" /var/www/html/index.html

exec nginx -g "daemon off;"
