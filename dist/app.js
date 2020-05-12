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
const db_1 = require("./db");
const app = express_1.default();
app.get("/all", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.ip);
    res.data = db_1.getAll();
    console.log(res.data);
    console.log('???');
    next("router");
}));
app.get("/cheap", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const top = parseInt(req.query.top);
    if (top) {
        res.data = db_1.getTopCheapest(top);
        next();
    }
    else {
        res.status(400);
        next(new Error("Missing query parameter - top:number "));
    }
}));
/* ----------------------------- Error handling ----------------------------- */
function errorHandler(err, req, res, next) {
    console.log('error handler?');
    if (err) {
        res.send({
            success: false,
            message: err.message
        });
    }
    // if no error, send data
    else {
        res.send({
            success: true,
            data: res.data
        });
    }
}
app.use(errorHandler);
const port = process.env.PORT || 6002;
app.listen(port, () => {
    console.log("GasPriceAPI running at ", port);
    gasPrices_1.updatePricesEveryOneHour();
});
//# sourceMappingURL=app.js.map