"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const cors_1 = __importDefault(require("cors"));
const registration_1 = __importDefault(require("./routes/registration"));
const authentication_1 = __importDefault(require("./routes/authentication"));
dotenv_1.default.config();
const { PORT } = process.env;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
(0, database_1.default)();
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
app.use("/", registration_1.default);
app.use("/", authentication_1.default);
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map