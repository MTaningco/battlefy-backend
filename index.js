const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(express.json());

app.get("/api/latestMatches", async (req, res) => {
    const summonerName = req.query.summoner;
    if (summonerName) {
        res.json(summonerName);
    } else {
        res.json("forbidden");
    }
});

app.listen(5000, () => {
    console.log("Server has started on port 5000");
});