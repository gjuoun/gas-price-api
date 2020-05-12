import axios from "axios";
import cheerio from "cheerio";
import { db, getAll, getTopCheapest } from './db'
import ms from 'ms'
import { Station } from "./types";

// const gasBuddyUrlExample = "https://www.gasbuddy.com/assets-v2/api/stations/16905/fuels"
const gasBuddyAPIBaseUrl = "https://www.gasbuddy.com/assets-v2/api/stations";

// const gasBuddyBasePageUrl = `https://www.gasbuddy.com/GasPrices/Nova%20Scotia/Halifax`;
const gasBuddyBasePageUrl = `https://www.gasbuddy.com/GasPrices/Nova%20Scotia`;

async function getFuelPriceByStationId(
  station_id: string,
  station_brand: string,
  station_address: string
): Promise<Station> {
  return new Promise<Station>(async (resolve, reject) => {
    try {
      const response = await axios.get(
        `${gasBuddyAPIBaseUrl}/${station_id}/fuels`
      );
      resolve(<Station>{
        station_brand,
        station_address,
        station_id: response.data.station_id,
        fuels: response.data.fuels,
      });
    } catch (e) {
      console.error("Failed fetch fuel prices by station_id - ", station_id);
      reject(e.message);
    }
  });
}

async function fetchPricesByPage(pageUrl: string) {
  try {
    const response = await axios.get(pageUrl);
    const $ = cheerio.load(response.data);

    const priceTrs = $("tbody#prices-table > tr[data-target]");
    // console.log(priceTrs.html());

    const pricesPromises: Promise<Station>[] = [];
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
    return prices

  } catch (e) {
    throw new Error("Error on fetching - " + pageUrl);
  }
}

async function updatePriceByCity(city: string) {
  const pageUrl = `${gasBuddyBasePageUrl}/${city}`
  const prices = await fetchPricesByPage(pageUrl);
  // save to db
  db.set("prices", prices).write();
  db.set("lastFetchAt", Date.now() / 1000).write();
}


export async function updatePricesEveryOneHour() {
  const prices = db.get("prices").value();
  const lastFetchAt = db.get("lastFetchAt").value();

  // set 1 hours as interval
  // const oneHour = 1000 * 60 * 60 * 1;
  const oneHour = ms('1h')

  if (!prices || Date.now() - lastFetchAt > oneHour) {
    console.log("Initialize - Fetch new prices !");
    updatePriceByCity("Halifax")
  }

  // fetch rate every 1 hours
  setInterval(async () => {
    updatePriceByCity("Halifax")
    console.log("Fetched new rate at ", Date.now() / 1000);
  }, oneHour);
}


