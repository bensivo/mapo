# Supabase setup


Project setup and database credentials
1. Login to supabase
2. Click "Create new project", make sure to generate a new DB password and save it somewhere
    - In "Security Options", uncheck the Data API
3. Copy the anonomous API Key and save it in infisical in SUPABASE_PUBLIC_API_KEY
4. Copy the project url and save it in infisical in SUPABASE_PROJECT_URL
5. Click on "connect" and copy the database connection string.
6. Url-encode your db password, then paste it into the connection string, and save it in Infisical in POSTGRES_CONNECTION_STRING
7. Go to "Project Settings" -> "Api" -> "JWT Secret" and copy it to infisical in JWT_SECRET. Also set JWT_ISSUER and JWT_AUDIENCE


Google oauth setup.
1. Follow all the steps in "google-oauth-setup"


