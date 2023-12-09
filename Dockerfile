# Build stage
FROM node:alpine AS build
WORKDIR /usr/src/app
COPY ./src ./src
COPY ./webpack.config.js ./
COPY ./package*.json ./
RUN npm install
RUN npm run build

# Run stage
FROM node:alpine AS run
WORKDIR /usr/src/app
# copy dist/server.js from build stage
COPY --from=build /usr/src/app/dist/server.js ./
EXPOSE 3000
CMD [ "node", "server.js" ]
