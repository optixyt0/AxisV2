const express = require("express");
const app = express();

app.get("/waitingroom/api/waitingroom", (req, res) => {
    return res.status(204).send()
});

module.exports = app;