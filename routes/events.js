const express = require("express");
const app = express();
const events = require("../responses/events.json");

app.get("/api/v1/events/Fortnite/download/:accountId", (req, res) => {
    const { accountId } = req.params;
    const { region, platform } = req.query;

    res.status(200).send([]);
});

module.exports = app;