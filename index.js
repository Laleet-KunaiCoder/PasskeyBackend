require("dotenv").config();
const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT;
server.listen(port, () => {
  console.log(`running server at port ${port}`);
});
