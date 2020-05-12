import axios from "axios";
import cheerio from "cheerio";
import _ from "lodash";
import { db, getAll, getTopCheapest } from './db'
import ms from 'ms'
import { Station } from "types";

// const gasBuddyUrlExample = "https://www.gasbuddy.com/assets-v2/api/stations/16905/fuels"
const gasBuddyAPIBaseUrl = "https://www.gasbuddy.com/assets-v2/api/stations/";
const gasBuddyHalifaxPageUrl = `https://www.gasbuddy.com/GasPrices/Nova%20Scotia/Halifax`;

async function fetchHalifaxPrices(pageUrl: string) {
  try {
    const response = await axios.get(pageUrl);
    const $ = cheerio.load(response.data);

    const priceTrs = $("tbody#prices-table > tr[data-target]");
    // console.log(priceTrs.html());

    const pricesPromises: Promise<object>[] = [];
    priceTrs.each(async (trIndex, trEl) => {
      const station_id: string = $(trEl).attr("data-target")!.match(/\d+$/)![0];
      const station_brand: string = $(trEl).find("strong>a").text();
      const station_address: string = $(trEl)
        .find("strong")
        .parent()
        .next()
        .text();

      pricesPromises.push(
        getFuelPriceByStationId(station_id, station_brand, station_address)
      );
    });

    const prices = await Promise.all(pricesPromises);

    // save to db
    db.set("prices", prices).write();
    db.set("lastFetchAt", Date.now()).write();
  } catch (e) {
    throw new Error("Error on fetching " + pageUrl);
  }
}

export async function getFuelPriceByStationId(
  station_id: string,
  station_brand: string,
  station_address: string
): Promise<object> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(
        `${gasBuddyAPIBaseUrl}/${station_id}/fuels`
      );
      resolve({ station_brand, station_address, ...response.data });
    } catch (e) {
      console.error("Failed fetch station_id - ", station_id);
      reject();
    }
  });
}

export async function updateLatestPrices() {
  const prices = db.get("prices").value();
  const lastFetchAt = db.get("lastFetchAt").value();

  // set 1 hours as interval
  // const oneHour = 1000 * 60 * 60 * 1;
  const oneHour = ms('1h')

  if (!prices || Date.now() - lastFetchAt > oneHour) {
    console.log("Fetch new prices !");
    await fetchHalifaxPrices(gasBuddyHalifaxPageUrl);
  }
  // fetch rate every 4 hours
  setInterval(async () => {
    await fetchHalifaxPrices(gasBuddyHalifaxPageUrl);
    console.log("Fetched new rate at ", new Date().toString());
  }, oneHour);
}


