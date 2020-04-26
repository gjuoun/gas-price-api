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
const dotenv_1 = __importDefault(require("dotenv"));
if (process.env.NODE_ENV !== "production") {
    dotenv_1.default.config();
}
const express_1 = __importDefault(require("express"));
const gasPrices_1 = require("./gasPrices");
const app = express_1.default();
app.get("/station", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.station_id) {
        return res.send({
            success: false,
            message: "no query parameter: station_id ",
        });
    }
    res.send({
        success: true,
        data: yield gasPrices_1.getFuelPriceByStationId(req.query.station_id),
    });
}));
app.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send({
        success: true,
        data: gasPrices_1.getAll(),
    });
}));
app.get("/cheap", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query.top) {
        return res.send({
            success: false,
            message: "no query parameter: top ",
        });
    }
    const top = parseInt(req.query.top);
    res.send({
        success: true,
        data: gasPrices_1.getTopCheapest(top),
    });
}));
const port = process.env.PORT || 6002;
app.listen(port, () => {
    console.log("GasPriceAPI running at ", port);
    gasPrices_1.updateLatestPrices();
});
//# sourceMappingURL=app.js.map