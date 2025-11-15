"use strict"

import http, { Server } from "http";
import fs, { copyFile } from "fs";
import express from "express";
import { Collection, Condition, MongoClient, MongoError, ObjectId } from "mongodb";
import { Configuration, ServerMessages } from "./configuration";

const app: express.Express = express();
const server: http.Server = http.createServer(app);
const config: Configuration = new Configuration();
const serverMsg: ServerMessages = new ServerMessages();
let errorPage: string = "";

server.listen(config.port, () => {
    console.info("Server is listening on port: " + config.port);
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

// ---------- DYNAMIC RESOURCES ----------
app.post("/api/login", async (req, res, next) => {
    if (req.body.email && req.body.password) {
        const email: string = req.body.email;
        const password: string = req.body.password;
        const client: MongoClient = new MongoClient(config.connectionString);

        await client.connect().catch((err) => {
            console.error(serverMsg.databaseConnectionRefused);
            res.status(503).send(serverMsg.databaseConnectionRefused);
            return;
        });

        const collection: Collection = client.db(config.dbName).collection(config.dbCollection);
        const cmd = collection.findOne({email, password});

        cmd
            .catch((err: MongoError) => {
                res.status(500).send(serverMsg.queryError + err.message);
            })
            .then(async (data) => {
                if (!data) return res.status(401).send(serverMsg.invalidCredentials);

                res.send({
                    _id: data._id,
                    name: data.name,
                    surname: data.surname
                });
            })
            .finally(() => {
                client.close();
            });
        return;
    }

    res.status(500).send(serverMsg.missingParameters);
    return;
});

app.get("/api/getUsersTasks", async (req, res, next) => {
    if (req.query.id) {
        const objectId: ObjectId = new ObjectId(req.query.id as string);
        const client: MongoClient = new MongoClient(config.connectionString);
        
        await client.connect().catch((err: MongoError) => {
            console.log(serverMsg.databaseConnectionRefused);
            res.status(503).send(serverMsg.databaseConnectionRefused);
        });

        const collection: Collection = client.db(config.dbName).collection(config.dbCollection);
        const cmd = collection.find({"_id": objectId, "role": "user", "tasks.completed": false}).sort({"dueDate": 1}).project({"tasks": 1, "_id": 0}).toArray();

        cmd
            .catch((err: MongoError) => {
                res.status(500).send(serverMsg.queryError + err.message);
            })
            .then((data) => {
                res.send(data);
            })
            .finally(() => {
                client.close();
            });
        return;
    }

    res.status(500).send(serverMsg.missingParameters);
    return;
});

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