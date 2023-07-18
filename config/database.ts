import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || " ";

const connect = () => {
  // Connecting to the database
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error: any) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
export default connect;
