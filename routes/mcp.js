const express = require('express');
const app = express();
const mongoose = require('mongoose');
const common_public = require('../DefaultProfiles/common_public.json');
const common_core = require('../DefaultProfiles/common_core.json');
const athena = require('../DefaultProfiles/athena.json');
const logger = require("../structs/logger");
const keychain = require('../responses/keychain.json');


app.post("/fortnite/api/game/v2/profile/:accountId/client/:operation", (req, res) => {
    const { accountId, operation } = req.params;

    if (operation == "QueryProfile") {
        const { profileId, rvn } = req.query;

        if (profileId == "common_public") {
            return res.status(200).send(common_public)
        } else if (profileId == "common_core") {
            return res.status(200).send(common_core)  
        } else if (profileId == "athena") {
            return res.status(200).send(athena)
        } 

    } else if (operation == "SetMtxPlatform") {
        if (req.query.profileId == "common_core") {
            return res.status(200).send(common_core);
        } else {
            return res.status(200).send({
                status: "OK",
                code: 200
            })
        }
    } else if (operation == "ClientQuestLogin") {
        return res.status(200).send({
            status: "OK",
            code: 200
        })
    } else {
        logger.error(`Operation not found: ${operation}`);
    }
});

app.get("/fortnite/api/calendar/v1/timeline", (req, res) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return res.status(200).json({
        channels: {
            "client-matchmaking": {
                states: [],
                cacheExpire: tomorrow.toISOString()
            },
            "client-events": {
                states: [{
                    validFrom: "0001-01-01T00:00:00.000Z",
                    activeEvents: [],
                    state: {
                        activeStorefronts: [],
                        eventNamedWeights: {},
                        seasonNumber: 8.51,
                        matchXpBonusPoints: 0,
                        seasonBegin: "2020-01-01T00:00:00Z",
                        seasonEnd: "9999-01-01T00:00:00Z",
                        seasonDisplayedEnd: "9999-01-01T00:00:00Z",
                        weeklyStoreEnd: "9999-01-01T00:00:00Z",
                        stwEventStoreEnd: "9999-01-01T00:00:00.000Z",
                        stwWeeklyStoreEnd: "9999-01-01T00:00:00.000Z",
                        sectionStoreEnds: {
                            Featured: tomorrow.toISOString()
                        },
                        dailyStoreEnd: tomorrow.toISOString()
                    }
                }],
                cacheExpire: tomorrow.toISOString()
            }
        },
        eventsTimeOffsetHrs: 0,
        cacheIntervalMins: 10,
        currentTime: new Date().toISOString()
    });
});

app.get('/fortnite/api/storefront/v2/keychain', (req, res) => {
    return res.status(200).send(keychain);
});

app.get('/fortnite/api/storefront/v2/catalog', (req, res) => {
    return res.status(200).send([]);
});

app.get('/fortnite/api/receipts/v1/account/:accountId/receipts', (req, res) => {
    return res.status(200).json({});
});

app.post('/api/v1/user/setting', async (req, res) => {
    return res.status(200).send({ message: "User settings updated" });
});

module.exports = app;