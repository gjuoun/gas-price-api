"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const db_1 = require("./db");
const ms_1 = __importDefault(require("ms"));
// const gasBuddyUrlExample = "https://www.gasbuddy.com/assets-v2/api/stations/16905/fuels"
const gasBuddyAPIBaseUrl = "https://www.gasbuddy.com/assets-v2/api/stations";
// const gasBuddyBasePageUrl = `https://www.gasbuddy.com/GasPrices/Nova%20Scotia/Halifax`;
const gasBuddyBasePageUrl = `https://www.gasbuddy.com/GasPrices/Nova%20Scotia`;
function getFuelPriceByStationId(station_id, station_brand, station_address) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${gasBuddyAPIBaseUrl}/${station_id}/fuels`);
                resolve({
                    station_brand,
                    station_address,
                    station_id: response.data.station_id,
                    fuels: response.data.fuels,
                });
            }
            catch (e) {
                console.error("Failed fetch fuel prices by station_id - ", station_id);
                reject(e.message);
            }
        }));
    });
}
function fetchPricesByPage(pageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pageUrl);
            const $ = cheerio_1.default.load(response.data);
            const priceTrs = $("tbody#prices-table > tr[data-target]");
            // console.log(priceTrs.html());
            const pricesPromises = [];
            priceTrs.each((trIndex, trEl) => __awaiter(this, void 0, void 0, function* () {
                const station_id = $(trEl).attr("data-target").match(/\d+$/)[0];
                const station_brand = $(trEl).find("strong>a").text();
                const station_address = $(trEl)
                    .find("strong")
                    .parent()
                    .next()
                    .text();
                pricesPromises.push(getFuelPriceByStationId(station_id, station_brand, station_address));
            }));
            const prices = yield Promise.all(pricesPromises);
            return prices;
        }
        catch (e) {
            throw new Error("Error on fetching - " + pageUrl);
        }
    });
}
function updatePriceByCity(city) {
    return __awaiter(this, void 0, void 0, function* () {
        const pageUrl = `${gasBuddyBasePageUrl}/${city}`;
        const prices = yield fetchPricesByPage(pageUrl);
        // save to db
        db_1.db.set("prices", prices).write();
        db_1.db.set("lastFetchAt", Math.round(Date.now() / 1000)).write();
    });
}
function updatePricesEveryOneHour() {
    return __awaiter(this, void 0, void 0, function* () {
        const prices = db_1.db.get("prices").value();
        const lastFetchAt = db_1.db.get("lastFetchAt").value();
        // set 1 hours as interval
        // const oneHour = 1000 * 60 * 60 * 1;
        const oneHour = ms_1.default('1h');
        if (!prices || Date.now() / 1000 - lastFetchAt > oneHour) {
            console.log("Initialize - Fetch new prices !");
            updatePriceByCity("Halifax");
        }
        // fetch rate every 1 hours
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            updatePriceByCity("Halifax");
            console.log("Fetched new rate at ", Math.round(Date.now() / 1000));
        }), oneHour);
    });
}
exports.updatePricesEveryOneHour = updatePricesEveryOneHour;
//# sourceMappingURL=gasPrices.js.map