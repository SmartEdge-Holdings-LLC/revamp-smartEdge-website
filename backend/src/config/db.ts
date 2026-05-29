import mongoose from "mongoose";
import { env } from "./env";

mongoose.connection.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("MongoDB connection error:", err);
});

export async function connectDb(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  const { host, name } = mongoose.connection;
  // eslint-disable-next-line no-console
  console.log(`✅ MongoDB connected (db: ${name}, host: ${host})`);
}
