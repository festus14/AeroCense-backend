"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!!</h1>");
  res.end();
});
router.get("/another", (req, res) =>
  res.json({ route: req.originalUrl, answer: "hello" })
);
router.post("/", (req, res) => res.json({ postBody: req.body }));

router.get("/air-quality-readings", (req, res, next) => {
  const { MongoClient } = require("mongodb");

  async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
  }

  async function main() {
    const uri =
      "mongodb+srv://festus:festuspassword@aerocense.myuwr.mongodb.net/air_quality_readings?retryWrites=true&w=majority";

    const client = new MongoClient(uri);
    try {
      await client.connect();
      // await listDatabases(client);
      const db = await client.db("air_quality_readings");
      const latestAirQuality = await db
        .collection("air_quality_readings")
        .find({})
        .sort({ datefield: -1 })
        .toArray();

      const latest = await latestAirQuality.reverse()[0];
      await console.log(latest);

      return res.json({ latest });
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  }

  main().catch(console.error);
});

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

module.exports = app;
module.exports.handler = serverless(app);
