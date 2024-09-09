# Can't pull images in buildx

- [Can't pull images in buildx](#cant-pull-images-in-buildx)
  - [Problem Description](#problem-description)
  - [Investigation](#investigation)
  - [Solution / Workarounds](#solution--workarounds)
  - [Action Items](#action-items)


## Problem Description

Reported At: 2024-09-09

Reported By: Ben Sivoravong

Description: 

When running the publish script, buildx tries to download images from dockerhub, then gets an error "write: operation not permitted" issues:
```
Fetching secrets from infisical
Authenticating with Github Container Registry (ghcr.io)
Login Succeeded
Building and pushing docker image
[+] Building 0.7s (5/5) FINISHED                                                                                  
 => [internal] load build definition from Dockerfile                                                         0.0s
 => => transferring dockerfile: 681B                                                                         0.0s
 => CANCELED [linux/arm64 internal] load metadata for docker.io/library/nginx:1.27-bookworm                  0.6s
 => ERROR [linux/arm64 internal] load metadata for docker.io/library/node:20-bookworm                        0.6s
 => CANCELED [linux/amd64 internal] load metadata for docker.io/library/nginx:1.27-bookworm                  0.6s
 => CANCELED [linux/amd64 internal] load metadata for docker.io/library/node:20-bookworm                     0.6s
------
 > [linux/arm64 internal] load metadata for docker.io/library/node:20-bookworm:
------
Dockerfile:1
--------------------
   1 | >>> FROM node:20-bookworm AS build
   2 |     
   3 |     WORKDIR /build/
--------------------
ERROR: failed to solve: node:20-bookworm: failed to resolve source metadata for docker.io/library/node:20-bookworm: failed to do request: Head "https://registry-1.docker.io/v2/library/node/manifests/20-bookworm": dial tcp: lookup registry-1.docker.io on 8.8.8.8:53: write udp 172.17.0.2:40078->8.8.8.8:53: write: operation not permitted
```

## Investigation

Similar issue mentioned here: https://stackoverflow.com/questions/69849498/unable-to-pull-docker-images-write-operation-not-permitted

- "The problem was caused because I had connected to a VPN which adjusted DNS settings after the docker service had started"
- Tried restarting my docker service, didn't work


Another thought, maybe my docker login was wrong. This did happen after I rotated my ghcr token.
- Removed ~/.docker/config.json
- Didn't do anything

Doing a regualr `docker pull nginx:1.27-bookworm` works fine. It just fails in buildx
- docker buildx rm <name>
- docker buildx create --name mapo 
- docker buildx use mapo
- still didn't work

From: https://stackoverflow.com/a/74875327, maybe setting buildkit to false would work?
- Tried it, didn't seem to work

While I was doing the above, I noticed I had a "dns" section in my docker engine configurations, I tried removing that
- That didn't fix it, but it did make the error change. Instead fo failing immediately, it failed after 30 seconds.
- Maybe this issue does have somthing to do with DNS, or maybe that's just adding another error on top of the existing one

Maybe I can just pull the images beforehand
- docker pull node:20-bookworm --platform linux/amd64
- docker pull node:20-bookworm --platform linux/arm64

This only happens in buildx, not in build, so can I just build the entire image in docker build?
- Swapped out the buildx command for just build, and a separate push command
- It worked. Still not sure why it doesn't work in buildx though.
## Solution / Workarounds

Workaround: just stop using buildx. Instead just do a `docker build --platform=linux/amd64 ...`


## Action Items

- This wouldn't be an issue in the future if we didn't depend on local machines for building and deploying. We need to create an real CICD pipeline for mapo deployments.
