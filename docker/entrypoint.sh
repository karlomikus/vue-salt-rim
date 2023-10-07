#!/bin/sh

envsubst < /var/www/config.js > /var/www/html/config.js

exec nginx -g "daemon off;"
