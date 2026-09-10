import "dotenv/config";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT ?? 3333);

const server = app.listen(port, () => {
  const address = server.address();
  console.log(`Florae API running on http://localhost:${typeof address === "object" && address ? address.port : port}`);
});
