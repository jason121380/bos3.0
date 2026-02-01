FROM node:20.12.1-alpine
WORKDIR /usr/app

COPY package.json /usr/app/
COPY ./build /usr/app/build
COPY ./node_modules /usr/app/node_modules

EXPOSE 3000
RUN yarn global add serve
CMD ["serve", "-s", "build"]


# docker build -t gcr.io/ml-group-204107/github.com/mrsunboss/beautyos:ricktest25 .
# docker push gcr.io/ml-group-204107/github.com/mrsunboss/beautyos:ricktest25

