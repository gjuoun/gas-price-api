import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from "express";
import {
  getFuelPriceByStationId,
  getAll,
  updateLatestPrices,
  getTopCheapest ,
} from "./gasPrices";
import _ from "lodash";

const app = express();

app.get("/", async (req, res) => {
  if (!req.query.station_id) {
    return res.send({
      success: false,
      message: "no query parameter: station_id ",
    });
  }
  res.send({
    success: true,
    data: await getFuelPriceByStationId(<string>req.query.station_id),
  });
});

app.get("/all", async (req, res) => {
  res.send({
    success: true,
    data: getAll(),
  });
});

app.get("/cheap", async (req, res) => {
  if (!req.query.top) {
    return res.send({
      success: false,
      message: "no query parameter: top ",
    });
  }
  const top = parseInt(<string>req.query.top);

  res.send({
    success: true,
    data: getTopCheapest(top),
  });
});

const port = process.env.PORT || 6002;
app.listen(port, () => {
  console.log("GasPriceAPI running at ", port);
  updateLatestPrices();
});
