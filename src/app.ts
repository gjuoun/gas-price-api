import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express, { NextFunction } from "express";
import {
  updateLatestPrices,
} from "./gasPrices";
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
    next(new Error("Missing query parameter - top:number "))
  }
});

/* ----------------------------- Error handling ----------------------------- */
function errorHandler(err: Error, req: express.Request, res: express.Response, next: NextFunction) {
  console.log(`Do we have an error?`)
  if (err) {
    res.send(<ApiResponse>{
      success: false,
      message: err.message
    })
  }
  // if no error, send data
  else {
    res.send(<ApiResponse>{
      success: true,
      data: res.data
    })
  }
}

app.use(errorHandler)


const port = process.env.PORT || 6002;
app.listen(port, () => {
  console.log("GasPriceAPI running at ", port);
  updateLatestPrices();
});
