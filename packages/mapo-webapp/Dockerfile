FROM node:20-bookworm as build

WORKDIR /build/

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:1.27-bookworm

RUN mkdir -p /mapo-webapp/html
COPY --from=build /build/dist/mapo-webapp/browser /mapo-webapp/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf