#!/bin/bash

# Exit if INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET are not set
if [[ -z "$INFISICAL_CLIENT_ID" ]]; then
  echo "Environment variable INFISICAL_CLIENT_ID is required"
  exit 1
fi

if [[ -z "$INFISICAL_CLIENT_SECRET" ]]; then
  echo "Environment variable INFISICAL_CLIENT_SECRET is required"
  exit 1
fi

if [[ -z "$INFISICAL_ENV" ]]; then
  echo "Environment variable INFISICAL_ENV is required"
  exit 1
fi

# Login to Infisical
echo "Logging in to infisical"
export INFISICAL_TOKEN=$(infisical login --method=universal-auth --client-id=$INFISICAL_CLIENT_ID --client-secret=$INFISICAL_CLIENT_SECRET --plain --silent)

# Get configs from infisical
MAPO_API_BASE_URL=`infisical secrets get MAPO_API_BASE_URL --plain --silent --env=$INFISICAL_ENV --projectId=$INFISICAL_PROJECT_ID`
SUPABASE_PROJECT_URL=`infisical secrets get SUPABASE_PROJECT_URL --plain --silent --env=$INFISICAL_ENV --projectId=$INFISICAL_PROJECT_ID`
SUPABASE_PUBLIC_API_KEY=`infisical secrets get SUPABASE_PUBLIC_API_KEY --plain --silent --env=$INFISICAL_ENV --projectId=$INFISICAL_PROJECT_ID`

# Generate config file
echo "Generating config.json"
cat > /mapo-webapp/html/config.json << EOF 
{
    "ENV":  "${INFISICAL_ENV}",
    "APP_VERSION": "${APP_VERSION}",
    "MAPO_API_BASE_URL": "${MAPO_API_BASE_URL}",
    "SUPABASE_PROJECT_URL": "${SUPABASE_PROJECT_URL}",
    "SUPABASE_PUBLIC_API_KEY": "${SUPABASE_PUBLIC_API_KEY}"
}
EOF

cat /mapo-webapp/html/config.json

# Start nginx
echo "Starting nginx"
exec nginx -g 'daemon off;'