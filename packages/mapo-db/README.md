# Mapo DB


Mapo uses supabase as a database provider. Supabase provides a few very useful features:
- Cheap fully managed postgres database
- Automatically-generated REST APIs using PostgREST
- Authentication and authorization integrated with the database itself at the row level



Some downsides of using Supabase are:
- Recreating a fully-local setup is slightly harder
- We aren't running a backend service, where we could implement more complex logic, and do migrations


This package contains:
- DB migrations run against the supabase database
- DB utility scripts for viewing data in the supabase database