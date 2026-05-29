"use strict";

/**
 * Production entry: runs compiled `dist/server.js` (bootstrap in `src/server.ts`).
 * Development: `npm run dev` → `tsx watch src/server.ts`
 */
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const distServer = path.join(__dirname, "dist", "server.js");
if (!fs.existsSync(distServer)) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing dist/server.js. Run `npm run build` before `node server.js`, or use `npm run dev` for development."
  );
  process.exit(1);
}

require(distServer);
