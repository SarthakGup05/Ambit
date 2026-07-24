import "./env.js"; // Initialize env vars before any other imports!
import { createServer } from "node:http";
import app from "./app.js";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

const server = createServer(app);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
