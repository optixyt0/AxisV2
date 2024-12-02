const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const crypto = require("node:crypto");

app.get("/fortnite/api/cloudstorage/system", (req, res) => {
    const dir = path.join(__dirname, "..", "CloudStorage")
    var CloudFiles = [];

    fs.readdirSync(dir).forEach(name => {
        if (name.toLowerCase().endsWith(".ini")) {
            const ParsedFile = fs.readFileSync(path.join(dir, name), 'utf-8');
            const ParsedStats = fs.statSync(path.join(dir, name));

            CloudFiles.push({
                "uniqueFilename": name,
                "filename": name,
                "hash": crypto.createHash('sha1').update(ParsedFile).digest('hex'),
                "hash256": crypto.createHash('sha256').update(ParsedFile).digest('hex'),
                "length": ParsedFile.length,
                "contentType": "application/octet-stream",
                "uploaded": ParsedStats.mtime,
                "storageType": "S3",
                "storageIds": {},
                "doNotCache": true
            })
        }
    });

    res.json(CloudFiles)
});

app.get("/fortnite/api/cloudstorage/system/:file", async (req, res) => {
    const file = path.join(__dirname, "..", "CloudStorage", req.params.file);

    if (fs.existsSync(file)) {
        const ParsedFile = fs.readFileSync(file);

        return res.status(200).send(ParsedFile).end();
    } else {
        res.status(200);
        res.end();
    }
})

app.get("/fortnite/api/cloudstorage/user/*", (req, res) => {
    return res.status(200).send({ status: "OK", code: "200" });
});

app.get("/fortnite/api/cloudstorage/user/*/*", (req, res) => {
    return res.status(200).send({ status: "OK", code: "200" });
});

module.exports = app;