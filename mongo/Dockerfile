FROM alpine:latest
COPY ./init /init-files
# Copy files to the shared volume on startup
CMD cp -a /init-files/ /docker-entrypoint-initdb.d/