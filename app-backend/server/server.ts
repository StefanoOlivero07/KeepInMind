"use strict"

// ------ Import ------
import http from "http";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, MongoError, ObjectId } from "mongodb";
import { Message } from "./message";

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

const message: Message = new Message();

// ------ Server creation ------
const server: http.Server = http.createServer(app);

server.listen(port, () => {
    console.info(message.SERVER_LISTENING + " " + port);
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
// Login (simple)
app.post("/api/login", async (req, res, next) => {

    if (!req.body.email || !req.body.password) {
        console.error(message.MISSING_PARAMETERS);
        res.status(400).send(message.MISSING_PARAMETERS);
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

    const collection = client.db(dbName).collection(process.env.USER_COLLECTION_NAME!);
    const cmd = collection.findOne({"email": userEmail, "password": userPassword}, {projection: {"_id": 1, "name": 1, "surname": 1}});

    cmd
        .then((data) => {
            if (data)
                res.send(data);
            else
                res.status(401).send(message.INVALID_CREDENTIALS);
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
        })
        .finally(() => {
            client.close();
        });
});

// Create new user
app.post("/api/createUser", async (req, res, next) => {
    if (!req.body.newUser) {
        console.log(message.MISSING_NEWUSER_PARAMETER);
        res.status(400).send(message.MISSING_NEWUSER_PARAMETER);
        return;
    }

    const result: string = await connectClient();
    
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.USER_COLLECTION_NAME!);
    const cmd = collection.insertOne(req.body.newUser);

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

// Get all tasks
app.get("/api/getAllTasks", async (req, res, next) => {

    if (!req.query.userId) {
        console.log(message.MISSING_USERID_PARAMETER);
        res.status(400).send(message.MISSING_USERID_PARAMETER);
        return;
    }

    const userId: ObjectId = new ObjectId(req.query.userId!.toString());

    const result: string = await connectClient();

    const response: any = {
        "notCompleted": [],
        "completed": [],
        "expired": []
    };

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
    const cmd1 = collection.find({"user._id": userId, "completed": true})
    .project({"title": 1})
    .toArray();

    cmd1
        .then((data) => {
            response.completed.push(data);

            const cmd2 = collection.find({"user._id": userId, "completed": false, "expiration": {"$gte": new Date().toLocaleDateString()}})
            .project({"title": 1})
            .toArray();

            cmd2
                .then((data) => {
                    response.notCompleted.push(data);

                    const cmd3 = collection.find({"user._id": userId, "completed": false, "expiration": {"$lt": new Date().toLocaleDateString()}})
                    .project({"title": 1})
                    .toArray();

                    cmd3
                        .then((data) => {
                            response.expired.push(data);

                            res.send(response);
                        })
                        .catch((err: MongoError) => {
                            console.error(err.message);
                            res.status(500).send(err.message);
                            return;
                        })
                        .finally(() => {
                            client.close();
                        });
                })
                .catch((err: MongoError) => {
                    console.error(err.message);
                    res.status(500).send(err.message);
                    client.close();
                    return;
                });
        })
        .catch((err: MongoError) => {
            console.error(err.message);
            res.status(500).send(err.message);
            client.close();
            return;
        });
});


// Get completed tasks
app.get("/api/getCompletedTasks", async (req, res, next) => {
    
    if (!req.query.userId) {
        console.error(message.MISSING_USERID_PARAMETER);
        res.status(400).send(message.MISSING_USERID_PARAMETER);
        return;
    }

    const userId: ObjectId = new ObjectId(req.query.userId!.toString());

    const result: string = await connectClient();
    
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
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
        console.error(message.MISSING_USERID_PARAMETER);
        res.status(400).send(message.MISSING_USERID_PARAMETER);
        return;
    }

    const userId: ObjectId = new ObjectId(req.query.userId!.toString());
    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
    const cmd = collection.find({"user._id": userId, "completed": false, "expiration": {"$gte": new Date().toLocaleDateString()}})
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
        console.error(message.MISSING_USERID_PARAMETER);
        res.status(400).send(message.MISSING_USERID_PARAMETER);
        return;
    }
    
    const userId: ObjectId = new ObjectId(req.query.userId!.toString());
    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
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
        console.error(message.MISSING_TASKID_PARAMETER);
        res.status(400).send(message.MISSING_TASKID_PARAMETER);
        return;
    }

    const taskId: ObjectId = new ObjectId(req.query.taskId!.toString());
    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
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

// New task
app.post("/api/createTask", async (req, res, next) => {

    if (!req.body.newTask) {
        console.log(message.MISSING_NEWTASK_PARAMETER);
        res.status(400).send(message.MISSING_NEWTASK_PARAMETER);
        return;
    }

    const result: string = await connectClient();

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
    const cmd = collection.insertOne(req.body.newTask);

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

// Delete task
app.delete("/api/deleteTask", async (req, res, next) => {

    if (!req.body.taskId) {
        console.log(message.MISSING_TASKID_PARAMETER);
        res.status(400).send(message.MISSING_TASKID_PARAMETER);
        return;
    }

    const result: string = await connectClient();
    const taskId: ObjectId = new ObjectId(req.body.taskId!.toString());

    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }

    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME!);
    const cmd = collection.deleteOne({"_id": taskId});

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
    res.send(message.RESOURCE_NOT_FOUND);
});

// ------ Functions ------

async function connectClient() {
    await client.connect().catch((err: MongoError) => {
        return err.message;
    });
    return "ok";
}