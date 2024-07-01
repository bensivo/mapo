FROM node:20-bookworm AS build

WORKDIR /build/

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration=production --base-href /app/


FROM nginx:1.27-bookworm

RUN mkdir -p /mapo-webapp/html
COPY --from=build /build/dist/mapo-webapp/browser /mapo-webapp/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf