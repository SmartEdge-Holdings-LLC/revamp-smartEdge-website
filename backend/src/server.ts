import http from "http";
import { app } from "./app";
import { connectDb } from "./config/db";
import { env } from "./config/env";
import { logConfiguredStripeProducts } from "./config/stripeProducts";
import { errorHandler } from "./middleware/errorHandler";

const PORT = env.port;
const server = http.createServer(app);

app.use(errorHandler);

void (async () => {
  try {
    await connectDb();
    logConfiguredStripeProducts();
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`   Swagger UI: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
