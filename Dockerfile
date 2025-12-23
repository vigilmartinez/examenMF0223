FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

FROM nginx:alpine

COPY --from=builder /app /usr/share/nginx/html

EXPOSE 80
