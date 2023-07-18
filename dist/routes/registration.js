"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const regcontroller_1 = require("../controllers/regcontroller");
const registrationRouter = express_1.default.Router();
registrationRouter.get("/generate-registration-options", regcontroller_1.getRegistration);
registrationRouter.post("/verify-registration", regcontroller_1.verifyRegistration);
exports.default = registrationRouter;
//# sourceMappingURL=registration.js.map