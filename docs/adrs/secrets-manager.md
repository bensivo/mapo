# ADR: Secrets Manager

## Context: 
For deployments, CICD, and runtime app configuration, it's best to have a purpose-built tool specifically for secrets management. This will let us maintain all the core app configurations from one place, and rotate secrets with minimal changes.

Requirements:
- Free or very cheap. We have no budget for Mapo right now
- Ideally, no limits on number of secrets
- A CLI interface, at the very least, but TS and golang libraries would also be nice
- Something super simple

## Options:
Infisical (https://infisical.com/)
- Pros:
  - Fully open source
  - Not locked in to a Cloud provider
  - Includes a CLI, and integrates directly with Docker
- Cons:
  - Only 2 environments in the free tier
  - No versioning in free tier
- Notes:
  - Seems newer, but people online seem to have good things to say about it

Doppler
- Notes:
  - Didn't actually look too much into this one. People mentioned it as another alternative, but it's closed source, adn seems like it has way more features than we need right now.

Hashicorp Vault 
- Pros:
  - Mature, trusted, super well known
  - Includes a CLI, and integrates directly with Docker
- Cons:
  - Only 25 secrets in the free tier (after that they charge per secret and access)
  - Long-term, running vault ourselves is kinda a nightmare

AWS Parameter Store
- Pros:
  - Super simple, once you're in AWS
  - Free for standard parameters
  - Long-term scalable. Almost certatnly won't need to be changed later
  - Once we setup auth with AWS, we can get access to other AWS services
- Cons:
  - AWS itself can be overkill

## Decision:
We'll try out Infisical for now, but knowing that our eventual solution will probably be AWS Parameter Store. I'm mostly just curious to try infisical to see if they're any good.

## Impact:
If this works well, infisical could fit all of Mapo's needs for secret management. It's simple Ui and cli tools will simplify setup for everything.

Long-term, we may switch to AWS anyways just for the ecosystem it brings.
