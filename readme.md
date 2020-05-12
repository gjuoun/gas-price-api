## Gas Price API

> Provides gas price ranking by city. Data from [GasBuddy](https://www.gasbuddy.com/) and 

[Github repo](https://github.com/gjuoun/gas-price-api)

[API documentation](https://stoplight.io/p/docs/gh/gjuoun/exchange-api)

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

