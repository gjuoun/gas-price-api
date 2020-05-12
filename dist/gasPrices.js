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
const lodash_1 = __importDefault(require("lodash"));
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const path_1 = __importDefault(require("path"));
const adapter = new FileSync_1.default(path_1.default.join(__dirname, "../db.json"));
exports.db = lowdb_1.default(adapter);
// const gasBuddyUrlExample = "https://www.gasbuddy.com/assets-v2/api/stations/16905/fuels"
const gasBuddyAPIBaseUrl = "https://www.gasbuddy.com/assets-v2/api/stations/";
const gasBuddyHalifaxPageUrl = `https://www.gasbuddy.com/GasPrices/Nova%20Scotia/Halifax`;
function fetchHalifaxPrices(pageUrl) {
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
            // save to db
            exports.db.set("prices", prices).write();
            exports.db.set("lastFetchAt", Date.now()).write();
        }
        catch (e) {
            throw new Error("Error on fetching " + pageUrl);
        }
    });
}
function getFuelPriceByStationId(station_id, station_brand, station_address) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${gasBuddyAPIBaseUrl}/${station_id}/fuels`);
                resolve(Object.assign({ station_brand, station_address }, response.data));
            }
            catch (e) {
                console.error("Failed fetch station_id - ", station_id);
                reject();
            }
        }));
    });
}
exports.getFuelPriceByStationId = getFuelPriceByStationId;
function updateLatestPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        const prices = exports.db.get("prices").value();
        const lastFetchAt = exports.db.get("lastFetchAt").value();
        // set 1 hours as interval
        const oneHour = 1000 * 60 * 60 * 1;
        if (!prices || Date.now() - lastFetchAt > oneHour) {
            console.log("Fetch new prices !");
            yield fetchHalifaxPrices(gasBuddyHalifaxPageUrl);
        }
        // fetch rate every 4 hours
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            yield fetchHalifaxPrices(gasBuddyHalifaxPageUrl);
            console.log("Fetched new rate at ", new Date().toString());
        }), oneHour);
    });
}
exports.updateLatestPrices = updateLatestPrices;
function getAll() {
    try {
        return exports.db.get("prices").value();
    }
    catch (e) {
        console.log("Cannot get rate from DB");
    }
}
exports.getAll = getAll;
function getTopCheapest(top) {
    const prices = exports.db.get("prices").value();
    const sortedPrices = lodash_1.default.sortBy(prices, [(o) => o.fuels[0].prices[0].price]);
    return lodash_1.default.take(sortedPrices, top);
}
exports.getTopCheapest = getTopCheapest;
// (async () => {
// await fetchHalifaxPrices(gasBuddyHalifaxPageUrl);
// })();
//# sourceMappingURL=gasPrices.js.map