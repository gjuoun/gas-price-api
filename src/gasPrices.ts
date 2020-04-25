import axios from "axios";
import cheerio from "cheerio";
import _ from "lodash";
import lowdb from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";

const adapter = new FileSync(path.join(__dirname, "db.json"));
export const db = lowdb(adapter);

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
      pricesPromises.push(getFuelPriceByStationId(station_id));
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
  station_id: string
): Promise<object> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(
        `${gasBuddyAPIBaseUrl}/${station_id}/fuels`
      );
      resolve(response.data);
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
  const oneHour = 1000 * 60 * 60 * 1;

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

export function getAll() {
  try {
    return db.get("prices").value();
  } catch (e) {
    console.log("Cannot get rate from DB");
  }
}

export function getTopCheapest(top: number) {
  const prices = db.get("prices").value();
  const sortedPrices = _.sortBy(prices, [(o) => o.fuels[0].prices[0].price]);
  return _.take(sortedPrices, top);
}
