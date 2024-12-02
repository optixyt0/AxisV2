const express = require("express");
const app = express();

app.post("/datarouter/api/v1/public/data", (req, res) => {
    return res.status(200).send({ status: "OK", code: "200" });
});

app.get("/fortnite/api/v2/versioncheck/*", (req, res) => {
    return res.status(200).send("NO_UPDATE")
})

module.exports = app;