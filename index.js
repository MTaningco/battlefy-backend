const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(express.json());

app.listen(5000, () => {
    console.log("Server has started on port 5000");
});