# ADR: Static Site Infrastructure

## Context: 
99% of Mapo's functionality exists in the client-facing web application, which we're building in Angular.
When we build the application as an SPA, we need to host it somewhere as a static site.

Some important factors influencing our choice:
- We're very early in development, with no real budget allotted for this project. Our solution should be cheap
- We will eventually need a backend API too, and it'd be nice to be able to reuse infra between frontend and backend
- We do not need scale
- We DO need developer productivity. Iteration speed is the most imporatant factor

## Options:
Nginx docker image, hosted in a VM in some VPS provider like Linode.
- Pros:
    - Simple, quick, fully open source
    - More predictable pricing
    - Same setup locally vs deployed
    - Will not scale as easily
- Cons:
    - Harder to scale, and keep maintained
    - Less secure
- Notes:
    - Will need some VM-configuration tool lke Ansible or Salt

AWS S3 + Cloudfront
- Pros:
    - More secure, production ready
    - More scalable
- Cons:
    - Less predictable pricing

## Decision:
Docker container in a linux VM for now, because of the consistency with local envs, but we will consider AWS in the future


## Impact:
We will need to switch later, if we hit scale and a single VM can't take the load