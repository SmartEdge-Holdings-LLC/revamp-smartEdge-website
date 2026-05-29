import mongoose from "mongoose";
import { env } from "./env";

mongoose.connection.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("MongoDB connection error:", err);
});

function logAtlasConnectionHints(err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  const isTlsFailure =
    message.includes("TLS") ||
    message.includes("SSL") ||
    message.includes("tlsv1 alert internal error");

  if (!env.mongodbUri.includes("mongodb.net") || !isTlsFailure) {
    return;
  }

  // eslint-disable-next-line no-console
  console.error(
    "\nMongoDB Atlas connection failed from this host. Check:\n" +
      "  1. Atlas → Network Access → allow Render (add 0.0.0.0/0, or Render static outbound IPs)\n" +
      "  2. Render env MONGODB_URI uses mongodb+srv:// with URL-encoded password\n" +
      "  3. Atlas → Database Access → user has read/write on the target database\n"
  );
}

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10_000,
    });
    const { host, name } = mongoose.connection;
    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB connected (db: ${name}, host: ${host})`);
  } catch (err) {
    logAtlasConnectionHints(err);
    throw err;
  }
}
