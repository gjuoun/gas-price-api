import lowdb from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import fs from 'fs'
import { Station } from "../types";

const dbPath = path.join(__dirname, "../../db.json")
let db: lowdb.LowdbSync<Schema>

type Schema = {
  lastFetchAt: number,
  prices: Station[]
}


if (fs.existsSync(dbPath)) {
  const adapter = new FileSync<Schema>(dbPath);
  db = lowdb(adapter);
} else {
  throw new Error("Error connecting db.json")
}

export function getAll(): Station[] {
  return db.get('prices').value();
}

export function getTopCheapest(top: number): Station[] {
  const prices = db.get("prices").value();
  //sort station by gas price
  const sortedPrices = _.sortBy(prices, [
    (o: Station) => o.fuels[0].prices[0].price
  ]);
  // take the top N stations
  return _.take(sortedPrices, top);
}


export { db }