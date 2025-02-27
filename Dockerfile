# base image
FROM node:14.15.4 AS builder
LABEL maintainer="grushton@broadinstitute.org"

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY src /usr/src/app/src
COPY public /usr/src/app/public
COPY package.json /usr/src/app/package.json
COPY config/base_config.json /usr/src/app/public/config.json
RUN npm install --silent
RUN npm install react-scripts@1.1.1 -g --silent
RUN npm run build --silent

FROM nginxinc/nginx-unprivileged:1.19.6-alpine
RUN rm -rf /etc/nginx/conf.d
COPY conf /etc/nginx
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
