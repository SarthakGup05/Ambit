import { createServer } from "node:http";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello from the API!" }));
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
