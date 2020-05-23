## Gas Price API

> Provides gas price ranking by city. Data from [GasBuddy](https://www.gasbuddy.com/) 

![Node.js CI](https://github.com/gjuoun/gas-price-api/workflows/Node.js%20CI/badge.svg)

[Github repo](https://github.com/gjuoun/gas-price-api)

[API documentation](https://stoplight.io/p/docs/gh/gjuoun/gas-price-api)

## Install

    > git clone https://github.com/gjuoun/gas-price-api

## Usage

    > npm run build

    > npm start

## Docker Usage

    > docker image build -t gas-price-api:1.0 .

    > docker run -d \
      -e PORT=6002 \
      -p 6002:6002 \
      gas-price-api:1.0


## Roadmap

- [x] Get price ranking in Halifax
- [x] Dockerfile
- [ ] Have NoSQL database options
- [ ] Get prices by given city name
