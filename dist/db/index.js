"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const dbPath = path_1.default.join(__dirname, "../../db.json");
let db;
exports.db = db;
if (fs_1.default.existsSync(dbPath)) {
    const adapter = new FileSync_1.default(dbPath);
    exports.db = db = lowdb_1.default(adapter);
}
else {
    throw new Error("Error connecting db.json");
}
function getAll() {
    return db.get('prices').value();
}
exports.getAll = getAll;
function getTopCheapest(top) {
    const prices = db.get("prices").value();
    //sort station by gas price
    const sortedPrices = lodash_1.default.sortBy(prices, [
        (o) => o.fuels[0].prices[0].price
    ]);
    // take the top N stations
    return lodash_1.default.take(sortedPrices, top);
}
exports.getTopCheapest = getTopCheapest;
//# sourceMappingURL=index.js.map