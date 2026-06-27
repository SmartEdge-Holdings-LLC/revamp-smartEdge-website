import mongoose from "mongoose";
import { Pick } from "../models/Pick";
import { env } from "../config/env";

async function migratePicks() {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log("Connected to MongoDB");

    const result = await Pick.updateMany(
      { access: "expert_picks" as any },
      { access: "monthly_vip" }
    );

    console.log(`✅ Migrated ${result.modifiedCount} picks from "expert_picks" to "monthly_vip"`);

    await mongoose.disconnect();
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

void migratePicks();
