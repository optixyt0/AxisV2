const express = require("express");
const app = express();
const fs = require("fs");
const mongoose = require('mongoose');
const logger = require("./structs/logger");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = Number(process.env.PORT) || 3551;
const DB_URI = process.env.MONGODB_URI || "mongodb://localhost/Axis";

app.listen(PORT, async () => {
    logger.backend(`AxisV2 is running on ${PORT}.`);
    // require("./api/api.js");
    if (process.env.REBOOT == "true") {
        logger.reboot("Access from Reboot Launcher is enabled.");
    } else {
        logger.reboot("Access from Reboot Launcher is disabled.");
    }

    if (process.env.DEBUG_FEATURES) {
        logger.debug("Debugging mode is enabled.");
    }
    await connectDB();
});

async function connectDB() {
    try {
        await mongoose.connect(DB_URI)
        logger.database("Connected to MongoDB!")
    } catch(err) {
        logger.error("Failed to connect to MongoDB: " + err)
    }
    
}

fs.readdirSync("./routes").forEach(fileName => {
    app.use(require(`./routes/${fileName}`))
});

app.get("/unknown", (req, res) => {
    if (process.env.REBOOT == "true") {
        return res.status(200).json({ message: "hello reboot!"})
    } else {
        logger.reboot("Request from Reboot Launcher was blocked.")
        req.destroy();
    }
})

app.use((req, res, next) => {
    res.status(404).json({ error: "uk.optixyt.errors.axis.notfound.endpoint", error_description: "No endpoint was found.", code: 404 });
    logger.backend("Unknown route hit: [" + req.method + "] " + req.url);
    next();
});

