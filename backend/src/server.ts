"use strict"

import http from "http";
import fs from "fs";
import express from "express";
import { Condition, MongoClient } from "mongodb";
import { Configuration } from "./configuration";

const app: express.Express = express();
const server: http.Server = http.createServer(app);
const config: Configuration = new Configuration();
let errorPage: string = "";

server.listen(config.port, () => {
    console.log("Server is listening on port: " + config.port);
});

// ---------- MIDDLEWARES ----------
//#region 
// Request Log
app.use("/", (req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    next();
});

// Static resources
// app.use("/", express.static(""))

// POST parameters
app.use("/", express.json({ "limit": config.postParametersSize }));

// POST parameters log
app.use("/", (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) console.log("Body parameters: " + JSON.stringify(req.body));
    next();
});

//#endregion

// ---------- DEFAULT ROUTES ----------
//#region 
app.use("/", (req, res, next) => {
    res.status(404);
    !req.originalUrl.startsWith("/api/") ? res.send(errorPage) : res.send("Resource not found");
});
//#endregion

// ---------- ERROR HANDLING ----------
//#region 
app.use("/", (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("****** ERROR ******\n" + err.stack);
    res.status(500).send(err.message);
});
//#endregion