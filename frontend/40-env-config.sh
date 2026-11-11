#!/bin/sh
set -e

API_URL="${VITE_API_URL:-http://localhost:8080}"
echo "Configuring runtime API URL: ${API_URL}"

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${API_URL}"
};
EOF

