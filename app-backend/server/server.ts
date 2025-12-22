"use strict"

// ------ Import ------
import http from "http";
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, MongoError, ObjectId } from "mongodb";

// ------ Configurations ------
const app: express.Express = express();
const envPath = path.join(__dirname, ".env");
dotenv.config({
    path: envPath
});

const connectionString: string | undefined = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error(`Missing DB_CONNECTION_STRING in ${envPath}`);
}
const port: number = parseInt(process.env.port!) || 3000;

const allowedOrigins = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    || ["http://localhost:4200"];

const dbName: string = process.env.DB_NAME!;
const client: MongoClient = new MongoClient(connectionString);

// ------ Server creation ------
const server: http.Server = http.createServer(app);

server.listen(port, () => {
    console.info("Server is listening on port " + port);
});

// ------ Middlewares ------
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use("/", (req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    next();
});

app.use("/", express.json({"limit": "5mb"}));

app.use("/", (req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0)
        console.log("Body parameters: " + JSON.stringify(req.body));
    next();
});

// ------ Dynamic resources ------
// login (simple)
app.post("/api/login", async (req, res, next) => {

    if (!req.body.email || !req.body.password) {
        console.error("Missing parameteres");
        res.status(400).send("Missing parameters");
        return;
    }

    const userEmail: string = req.body.email;
    const userPassword: string = req.body.password;

    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.COLLECTION_NAME!);
    const cmd = collection.findOne({"user.email": userEmail, "user.password": userPassword}, {projection: {"user._id": 1, "user.name": 1, "user.surname": 1, "_id": 0}});

    cmd
        .then((data) => {
            if (data)
                res.send(data);
            else
                res.status(401).send("Invalid credentials");
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
        })
        .finally(() => {
            client.close();
        });
});


// Get completed tasks
app.get("/api/getCompletedTasks", async (req, res, next) => {
    
    if (!req.query.userId) {
        console.error("Missing userId parameter");
        res.status(400).send("Missing userId parameter");
        return;
    }

    const userId: ObjectId = new ObjectId(req.query.userId!.toString());

    const result: string = await connectClient();
    
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.COLLECTION_NAME!);
    const cmd = collection.find({"user._id": userId, "completed": true})
        .project({"title": 1, "description": 1, "category": 1, "expiration": 1, "_id": 0})
        .sort({"expiration": 1})
        .toArray();
    
    cmd
        .then((data) => {
            res.send(data);
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
        })
        .finally(() => {
            client.close();
        });
});

// Get not completed tasks
app.get("/api/getNotCompletedTasks", async (req, res, next) => {

    if (!req.query.userId) {
        console.error("Missing userId parameter");
        res.status(400).send("Missing userId parameter");
        return;
    }

    const userId: ObjectId = new ObjectId(req.query.userId!.toString());
    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.COLLECTION_NAME!);
    const cmd = collection.find({"user._id": userId, "completed": false})
        .project({"title": 1, "description": 1, "category": 1, "expiration": 1, "_id": 0})
        .sort({"expiration": 1})
        .toArray();

    cmd
        .then((data) => {
            res.send(data);
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
        })
        .finally(() => {
            client.close();
        });
});

// Get expired tasks
app.get("/api/getExpiredTasks", async (req, res, next) => {

    if (!req.query.userId) {
        console.error("Missing userId parameter");
        res.status(400).send("Missing userId parameter");
        return;
    }
    
    const userId: ObjectId = new ObjectId(req.query.userId!.toString());
    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.COLLECTION_NAME!);
    const cmd = collection.find({"user._id": userId, "expiration": {"$lt": new Date().toLocaleDateString()}, "completed": false})
        .project({"title": 1, "description": 1, "category": 1, "expiration": 1, "_id": 0})
        .sort({"expiration": 1})
        .toArray();
    
    cmd
        .then((data) => {
            res.send(data);
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
        })
        .finally(() => {
            client.close();
        });
});

// Get task by id
app.get("/api/getTaskById", async (req, res, next) => {

    if (!req.query.taskId) {
        console.error("Missing taskId parameter");
        res.status(400).send("Missing taskId parameter");
        return;
    }

    const taskId: ObjectId = new ObjectId(req.query.taskId!.toString());
    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.COLLECTION_NAME!);
    const cmd = collection.findOne({"_id": taskId}, {projection: {"title": 1, "description": 1, "category": 1, "created": 1, "expiration": 1, "notes": 1, "completed": 1, "_id": 0}});

    cmd
        .then((data) => {
            res.send(data);
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
        })
        .finally(() => {
            client.close();
        });
});

// ------ Default route ------
app.use("/", (req, res, next) => {
    res.status(404);
    res.send("Resource not found");
});

// ------ Functions ------

async function connectClient() {
    await client.connect().catch((err: MongoError) => {
        return err.message;
    });
    return "ok";
}