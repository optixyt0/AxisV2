const express = require("express");
const app = express();
const User = require("../models/user");
const mongoose = require("mongoose");

app.get("/account/api/public/account/:accountId", (req, res) => {
    const accountId = req.params.accountId;

    const user = User.findOne({ accountId: accountId });

    if (!user) {
        return res.status(400).json({ error: "uk.optixyt.errors.axis.notfound.user", error_description: "User was not found.", code: 404 });
    }

    return res.status(200).send({ id: accountId, displayName: user.username, email: user.email, externalAuths: {} });
});

app.get("/account/api/public/account/", (req, res) => {
    const accountId = req.query.accountId;
    const user = User.findOne({ accountId: accountId });

    if (!user) {
        return res.status(400).json({ error: "uk.optixyt.errors.axis.notfound.user", error_description: "User was not found.", code: 404 });
    }

    return res.status(200).send({ id: accountId, displayName: user.username, email: user.email, externalAuths: {} });
});

app.get("/fortnite/api/game/v2/privacy/account/", (req, res) => {
    return res.status(200).send({ status: "OK", code: "200" });
});

app.get("/account/api/public/account/displayName/:displayName", (req, res) => {
    const displayName = req.query.displayName;
    const user = User.findOne({ username: displayName });

    if (!user) {
        return res.status(400).json({ error: "uk.optixyt.errors.axis.notfound.user", error_description: "User was not found.", code: 404 });
    }

    return res.status(200).send({ id: user.accountId, displayName: user.username, email: user.email, externalAuths: {} });
});

app.get("/account/api/public/account/:accountId/externalAuths", (req, res) => {
    const { accountId } = req.params;
    return res.status(200).send({ accountId: accountId, externalAuths: [] });
});

app.get("/fortnite/api/game/v2/enabled_features", (req, res) => {
    return res.status(200).send([]);
});

app.post("/fortnite/api/game/v2/tryPlayOnPlatform/account/*", (req, res) => {
    return res.status(200).send("true");
});

app.post("/fortnite/api/game/v2/grant_access/:accountId", (req, res) => {
    return res.status(200).json({ message: "Ok", status: 200 });
});





module.exports = app;