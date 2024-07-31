# Google Oauth Setup

1. Login to GCP at https://console.cloud.google.com
2. Create a new project, if you haven't already. I called it "mapo-dev" or "mapo-prod"
3. Go to "API & Services" -> "OAuth Consent Screen"
    - Set "User Type" to "External"
    - Fill out the rest of the form, filling in the app name, and domain
    - In "Scopes", add openid, profile, and email
4. Go to "Credentials" -> "Create crednetials" -> "OAuth client"
    - App type = web application
    - Name = mapo-prod
    - Authorized origins = <your website url>
    - Authorized redirect urls = 
        - Go to supabase -> project -> Authorization -> providers -> google
    - Copy the client id and secret into infisical GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET
    - Copy the client id and secret into supabase

5. Go to "Authentiation" -> "URL Configuration" -> Site Url. And update the URL to the url you want to redirect to after login