import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const ConnectDB = async () => {
  try {
    const mongo_url = process.env.MONGO_URI;

    if (!mongo_url) {
      throw new Error("MONGO_URI not found in .env");
    }

    await mongoose.connect(mongo_url);

    console.log("Database connection successful!!");

  } catch (err) {
    console.log("Database connection failed:", err.message);
    process.exit(1);
  }
};