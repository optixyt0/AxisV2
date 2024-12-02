const express = require("express");
const app = express();
const fs = require("fs");
const mongoose = require('mongoose');
const logger = require("../structs/logger");
const User = require("../models/user");
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const { Server } = require("ws");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const API_PORT = Number(process.env.API_PORT) || 7979;

const server = app.listen(API_PORT, async () => {
    logger.backend(`AxisV2 API is running on ${API_PORT}.`);
});


const wss = new Server({ server });

wss.on("connection", async (ws, req) => {
    const params = new URLSearchParams(req.url.replace(/^\/\?/, ""));
    const accountId = params.get("accountId");

    if (!accountId) {
        ws.close(1008, "Missing accountId");
        return;
    }

    logger.backend(`WebSocket connected for accountId: ${accountId}`);
    ws.accountId = accountId;
    const user = await User.findOne({ accountId: accountId });
    await user.updateOne({ 
        launcherLoggedIn: true 
    });

    ws.on("message", (message) => {
        logger.backend(`Received message from ${accountId}: ${message}`);
    });

    ws.on("close", async (code, reason) => {
        logger.backend(`WebSocket disconnected for accountId: ${accountId}, Code: ${code}, Reason: ${reason}`);
        await user.updateOne({ 
            launcherLoggedIn: false 
        });
    });

    ws.on("error", (error) => {
        logger.backend(`WebSocket error for accountId: ${accountId}, Error: ${error.message}`);
    });
});

app.post("/account/api/oauth/create", async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({  email });

        if (existingUser) {
            return res.status(400).json({
                error: "uk.optixyt.errors.axis.exists.user",
                error_description: "User already exists.",
                code: 400
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const accountId = crypto.randomBytes(16).toString("hex");

        const newUser = new User({
            email: email,
            username: username,
            username_lower: username.toLowerCase(),
            accountId: accountId,
            password: hashedPassword,
            created: new Date(),
            banned: false
        });

        await newUser.save();

        return res.status(201).json({
            username: newUser.username,
            message: "Welcome to Lightning!",
            email: newUser.email,
            accountId: newUser.accountId
        });

    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            message: "An error occurred while creating the user."
        });
    }
});

app.delete("/account/api/oauth/delete", async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({
                error: "uk.optixyt.errors.axis.nonexistant.user",
                error_description: "User doesn't exist.",
                code: 400
            });
        }

        await existingUser.deleteMany({});

        return res.status(204).json({
            message: "Goodbye from Lightning!"
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            error: "Internal Server Error",
            message: "An error occurred while deleting the user."
        });
    }
});

app.use((req, res, next) => {
    res.status(404).json({ error: "uk.optixyt.errors.axis.notfound.endpoint", error_description: "No endpoint was found.", code: 404 });
    logger.backend("Unknown route hit: [" + req.method + "] " + req.url);
    next();
});

