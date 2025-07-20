#!/bin/sh
# This script injects runtime environment variables into the built React app

# Create a runtime config file
cat > /usr/share/nginx/html/env-config.js <<EOF
window._env_ = {
  VITE_API_URL: "${VITE_API_URL}"
};
EOF

# Also update the index.html to include the env-config.js
if [ -f /usr/share/nginx/html/index.html ]; then
    sed -i 's|</head>|<script src="/env-config.js"></script></head>|' /usr/share/nginx/html/index.html
fi