const express = require('express');
const app = express();

app.get("/friends/api/public/friends/*", async (req, res) => {
    res.status(200).send([]);
});

app.get("/friends/api/public/blocklist/*", async (req, res) => {
    res.status(200).send([]);
});

app.get("/friends/api/public/list/fortnite/:accountId/recentPlayers", (req, res) => {
    res.status(200).send([]);
});

app.get("/friends/api/v1/:accountId/settings", (req, res) => {
    res.status(200).send([]);
});

module.exports = app;