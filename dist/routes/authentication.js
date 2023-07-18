"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authcontroller_1 = require("../controllers/authcontroller");
const authenticationRouter = express_1.default.Router();
authenticationRouter.get("/generate-authentication-options", authcontroller_1.getAuthentication);
authenticationRouter.post("/verify-authentication", authcontroller_1.verifyAuthentication);
exports.default = authenticationRouter;
//# sourceMappingURL=authentication.js.map