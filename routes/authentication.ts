import express, { Router } from "express";
import {
  getAuthentication,
  verifyAuthentication,
} from "../controllers/authcontroller";

const authenticationRouter: Router = express.Router();

authenticationRouter.get("/generate-authentication-options", getAuthentication);
authenticationRouter.post("/verify-authentication", verifyAuthentication);

export default authenticationRouter;
