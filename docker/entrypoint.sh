#!/bin/sh

envsubst < /var/www/config.js > /var/www/html/config.js

# Generate a cache buster based on the config file's content hash
CONFIG_HASH=$(md5sum /var/www/html/config.js | cut -d' ' -f1)

# Update the HTML to include the cache buster query parameter
sed -i "s|<script src=\"/config.js\"></script>|<script src=\"/config.js?v=${CONFIG_HASH}\"></script>|g" /var/www/html/index.html

exec nginx -g "daemon off;"
