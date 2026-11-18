#!/bin/sh

envsubst < /var/www/config.js > /var/www/html/config.js

# Generate a cache buster based on the config file's content hash
CONFIG_HASH=$(md5sum /var/www/html/config.js | cut -d' ' -f1)

# Update the HTML to include the cache buster query parameter
if grep -q 'src="/config.js"' /var/www/html/index.html; then
    sed -i "s|src=\"/config.js\"|src=\"/config.js?v=${CONFIG_HASH}\"|" /var/www/html/index.html
else
    echo "entrypoint: config.js script tag not found in index.html, skipping cache busting" >&2
fi

exec nginx -g "daemon off;"
