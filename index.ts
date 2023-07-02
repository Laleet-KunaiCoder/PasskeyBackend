import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import connect from "./config/database";
import cors from "cors";
import registrationRouter from "./routes/registration";
import authenticationRouter from "./routes/authentication";

dotenv.config();
const { PORT } = process.env;

const app: Express = express();

app.use(express.json());
app.use(cors());
connect();

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/", registrationRouter);
app.use("/", authenticationRouter);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
