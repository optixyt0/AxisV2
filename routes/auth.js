const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const app = express();
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const logger = require("../structs/logger");

app.post("/account/api/oauth/token", async (req, res) => {
    const { grant_type } = req.body;
    const authHeader = req.headers["authorization"];
        let clientId;

        if (authHeader) {
            try {
                const base64Credentials = authHeader.split(" ")[1];
                const credentials = Buffer.from(base64Credentials, "base64").toString();
                [clientId] = credentials.split(":");
            } catch (err) {
                logger.error("Invalid Authorization Header Format", err);
            }
        }

        if (!clientId) {
            return res.status(400).json({ errorCode: "uk.optixyt.errors.axis.invalid_client", errorMessage: "ClientId could not be extracted" });
        }
    
    if (grant_type == "password") {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                error: "uk.optixyt.errors.axis.missingcredentials",
                error_description: "Email and password are required.",
                code: 400,
            });
        }
       const user = await User.findOne({ email: username });
        if (!user) {
            return res.status(404).json({ error: "uk.optixyt.errors.axis.notfound.user", error_description: "User was not found.", code: 404 });
        }
        const comparison = bcrypt.compareSync(password, user.password);
        if (!comparison) {
            return res.status(400).json({ error: "uk.optixyt.errors.axis.invalid.password", error_description: "Incorrect Password.", code: 400 });
        }
        if (user.banned) {
            return res.status(400).json({ error: "uk.optixyt.errors.axis.user.banned", error_description: "You have been permanently banned from playing Lightning.", code: 400 });
        }

        const deviceId = crypto.randomBytes(16).toString("hex");
        const newRefreshToken = crypto.randomBytes(32).toString('hex');

        const accesstoken = jwt.sign({
            accountId: user.accountId,
            displayName: user.username,
            refresh_token: newRefreshToken,
            device_id: deviceId,
            clientId: clientId,
            expires_at: new Date(Date.now() + 14400 * 1000).toISOString()
        }, process.env.JWT_SECRET,
        { expiresIn: "8h" });
        
        return res.status(200).json({
            access_token: accesstoken,
            expires_in: 14400,
            expires_at: new Date(Date.now() + 14400 * 1000).toISOString(),
            token_type: "bearer",
            refresh_token: newRefreshToken,
            refresh_expires: 14400,
            refresh_expires_at: new Date(Date.now() + 14400 * 1000).toISOString(),
            account_id: user.accountId,
            client_id: clientId,
            internal_client: true,
            client_service: "fortnite",
            displayName: user.username,
            app: "Fortnite",
            in_app_id: user.accountId,
            device_id: deviceId
        });

    } else if (grant_type == "client_credentials") {
        const { token_type } = req.body;
        if (!token_type) {
            return res.status(400).json({ error: "uk.optixyt.errors.axis.notfound.token_type", error_description: "token_type was not found in body of request.", code: 404 });
        }

        const newToken = crypto.randomBytes(32).toString('hex');
        return res.status(200).json({
            access_token: `${token_type}~${newToken}`,
            expires_in: 14400,
            expires_at: new Date(Date.now() + 14400 * 1000).toISOString(),
            token_type: "bearer",
            client_id: clientId,
            internal_client: true,
            client_service: "fortnite"
        });
    } else {
        return res.status(400).json({ error: "uk.optixyt.errors.axis.invalid_grant_type", error_description: "Invalid Grant Type was provided.", code: 404 });
    }
});

app.get('/account/api/oauth/verify', async (req, res) => {
    const { authorization } = req.headers;
        res.header('Content-Type', 'application/json');

        if (!authorization || !authorization.startsWith('bearer ')) {
            console.error("Authorization token is required");
            return res.status(400).send({
                error: 'uk.optixyt.errors.axis.missing_token',
                error_description: 'Authorization token is required'
            });
        }


        const token = authorization.split(' ')[1];

        const decrypted = jwt.decode(token);

        const user = await User.findOne({ accountId: decrypted.accountId })
        if (!user) {
            return res.status(404).send({
                error: "uk.optixyt.errors.axis.user.not_found",
                error_description: "The user was not found in the database",
                code: 404
            })
        } 

        return res.status(200).send({
            "access_token": token,
            "expires_in": 14400,
            "expires_at": decrypted.expires_at,
            "token_type": "bearer",
            "refresh_token": decrypted.refresh_token,
            "refresh_expires": 14400,
            "refresh_expires_at": decrypted.expires_at,
            "account_id": user.accountId,
            "client_id": decrypted.clientId,
            "internal_client": true,
            "client_service": "fortnite",
            "displayName": decrypted.username,
            "app": "fortnite",
            "in_app_id": decrypted.accountId,
            "device_id": decrypted.deviceId
        })

})

app.delete("/account/api/oauth/sessions/kill*", (req, res) => {
    return res.status(200).json({ message: "Sessions killed" });
});


module.exports = app;