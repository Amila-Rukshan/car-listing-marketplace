const express = require("express");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");

const { databaseMiddleware } = require("./middleware/database");
const routes = require("./routes/v1");

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use(compression());
app.use(cors());
app.options("*", cors());

app.use("/v1", routes);

app.get("/", (req, res) => res.json({ message: "Welcome to Car Rental API" }));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Car Listing Marketplace Listening on port: ${port}`)
);

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close(() => {
    console.log("Http server closed.");
    req.db.end((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log("Database connection pool closed.");
      process.exit(0);
    });
  });
});
