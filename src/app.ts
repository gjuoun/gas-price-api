import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express, { NextFunction } from "express";
import {updatePricesEveryOneHour} from "./gasPrices";
import _ from "lodash";
import { getTopCheapest, getAll } from './db'
import { ApiResponse } from "types";

const app = express();


app.get("/all", async (req, res, next) => {
  res.data = getAll()
  next()
});

app.get("/cheap", async (req, res: express.Response, next) => {
  const top = parseInt(<string>req.query.top);

  if (top) {
    res.data = getTopCheapest(top)
    next()
  }
  else {
    res.status(400)
    next(new Error("query parameter 'top' should be a number"))
  }
});

/* ----------------------------- Error handling ----------------------------- */
app.use(function (err: Error, req: express.Request, res: express.Response, next: NextFunction) {
  res.send(<ApiResponse>{
    success: false,
    message: err.message
  })
})

/* ----------------------------- Success Handler ---------------------------- */
// send formatted data or endpoint information
app.use((req, res, next) => {
  if (res.data) {
    res.send(<ApiResponse>{
      success: true,
      data: res.data
    })
  } else {
    res.send(<ApiResponse>{
      success: true,
      message: 'endpoint: /all /cheap'
    })
  }
})


const port = process.env.PORT || 6002;
app.listen(port, () => {
  console.log("GasPriceAPI running at ", port);
  updatePricesEveryOneHour();
});
