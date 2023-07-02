import express, { Router } from "express";
import { getRegistration, verifyRegistration } from "../controllers/regcontroller";

const registrationRouter: Router = express.Router();

registrationRouter.get("/generate-registration-options", getRegistration);
registrationRouter.post("/verify-registration", verifyRegistration);

export default registrationRouter;
