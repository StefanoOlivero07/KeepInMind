"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ------ Import ------
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const message_1 = require("./message");
// ------ Configurations ------
const app = (0, express_1.default)();
const envPath = path_1.default.join(__dirname, ".env");
dotenv_1.default.config({
    path: envPath
});
const connectionString = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
    throw new Error(`Missing DB_CONNECTION_STRING in ${envPath}`);
}
const port = parseInt(process.env.port) || 3000;
const allowedOrigins = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    || ["http://localhost:4200"];
const dbName = process.env.DB_NAME;
const client = new mongodb_1.MongoClient(connectionString);
const message = new message_1.Message();
// ------ Server creation ------
const server = http_1.default.createServer(app);
server.listen(port, () => {
    console.info(message.SERVER_LISTENING + " " + port);
});
// ------ Middlewares ------
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use("/", (req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    next();
});
app.use("/", express_1.default.json({ "limit": "5mb" }));
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
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.USER_COLLECTION_NAME);
    const cmd = collection.findOne({ "email": userEmail, "password": userPassword }, { projection: { "_id": 1, "name": 1, "surname": 1 } });
    cmd
        .then((data) => {
        if (data)
            res.send(data);
        else
            res.status(401).send(message.INVALID_CREDENTIALS);
    })
        .catch((err) => {
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
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.USER_COLLECTION_NAME);
    const cmd = collection.insertOne(req.body.newUser);
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
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
    const userId = new mongodb_1.ObjectId(req.query.userId.toString());
    const result = await connectClient();
    const response = {
        "notCompleted": [],
        "completed": [],
        "expired": []
    };
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd1 = collection.find({ "user._id": userId, "completed": true })
        .project({ "title": 1 })
        .toArray();
    cmd1
        .then((data) => {
        response.completed.push(data);
        const cmd2 = collection.find({ "user._id": userId, "completed": false, "expiration": { "$gte": new Date().toLocaleDateString() } })
            .project({ "title": 1 })
            .toArray();
        cmd2
            .then((data) => {
            response.notCompleted.push(data);
            const cmd3 = collection.find({ "user._id": userId, "completed": false, "expiration": { "$lt": new Date().toLocaleDateString() } })
                .project({ "title": 1 })
                .toArray();
            cmd3
                .then((data) => {
                response.expired.push(data);
                res.send(response);
            })
                .catch((err) => {
                console.error(err.message);
                res.status(500).send(err.message);
                return;
            })
                .finally(() => {
                client.close();
            });
        })
            .catch((err) => {
            console.error(err.message);
            res.status(500).send(err.message);
            client.close();
            return;
        });
    })
        .catch((err) => {
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
    const userId = new mongodb_1.ObjectId(req.query.userId.toString());
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.find({ "user._id": userId, "completed": true })
        .project({ "title": 1, "description": 1, "category": 1, "expiration": 1, "_id": 0 })
        .sort({ "expiration": 1 })
        .toArray();
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
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
    const userId = new mongodb_1.ObjectId(req.query.userId.toString());
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.find({ "user._id": userId, "completed": false, "expiration": { "$gte": new Date().toLocaleDateString() } })
        .project({ "title": 1, "description": 1, "category": 1, "expiration": 1, "_id": 0 })
        .sort({ "expiration": 1 })
        .toArray();
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
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
    const userId = new mongodb_1.ObjectId(req.query.userId.toString());
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.find({ "user._id": userId, "expiration": { "$lt": new Date().toLocaleDateString() }, "completed": false })
        .project({ "title": 1, "description": 1, "category": 1, "expiration": 1, "_id": 0 })
        .sort({ "expiration": 1 })
        .toArray();
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
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
    const taskId = new mongodb_1.ObjectId(req.query.taskId.toString());
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.findOne({ "_id": taskId }, { projection: { "title": 1, "description": 1, "category": 1, "created": 1, "expiration": 1, "notes": 1, "completed": 1, "_id": 0 } });
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
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
    const result = await connectClient();
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.insertOne(req.body.newTask);
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
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
    const result = await connectClient();
    const taskId = new mongodb_1.ObjectId(req.body.taskId.toString());
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.deleteOne({ "_id": taskId });
    cmd
        .then((data) => {
        res.send(data);
    })
        .catch((err) => {
        console.error(err.message);
        res.status(500).send(err.message);
    })
        .finally(() => {
        client.close();
    });
});
// Export completed tasks
app.post("/api/exportCompletedTasks", async (req, res, next) => {
    if (!req.body.userId) {
        console.log(message.MISSING_USERID_PARAMETER);
        res.status(400).send(message.MISSING_USERID_PARAMETER);
        return;
    }
    const result = await connectClient();
    const userId = new mongodb_1.ObjectId(req.body.userId.toString());
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.find({ "user._id": userId, "completed": true })
        .project({ "_id": 1, "title": 1, "description": 1, "category": 1, "created": 1, "completedAt": 1, "notes": 1 })
        .toArray();
    cmd
        .then(async (data) => {
        try {
            console.log(data);
            const response = await fetch(`${process.env.ASP_EXPORTS_URL}/api/exports/completedTasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                return res.status(response.status).send(message.ASP_MICROSERVICE_ERROR);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            res.setHeader("Content-Disposition", "attachment; filename=completed-tasks.docx");
            res.send(buffer);
        }
        catch (error) {
            console.error(error);
            res.status(500).send(message.EXPORT_ERROR);
        }
    })
        .catch((err) => {
        console.error(err.message);
        res.status(500).send(err.message);
    })
        .finally(() => {
        client.close();
    });
});
// Export not completed tasks
app.post("/api/exportNotCompletedTasks", async (req, res, next) => {
    if (!req.body.userId) {
        console.log(message.MISSING_USERID_PARAMETER);
        res.status(400).send(message.MISSING_USERID_PARAMETER);
        return;
    }
    const result = await connectClient();
    const userId = new mongodb_1.ObjectId(req.body.userId.toString());
    if (result != "ok") {
        console.error(result);
        res.status(503).send(result);
        return;
    }
    const collection = client.db(dbName).collection(process.env.TASK_COLLECTION_NAME);
    const cmd = collection.find({ "user._id": userId, "completed": false, "expiration": { "$gte": new Date().toLocaleDateString() } })
        .project({ "_id": 1, "title": 1, "description": 1, "category": 1, "created": 1, "expiration": 1, "notes": 1 })
        .toArray();
    cmd
        .then(async (data) => {
        try {
            console.log(data);
            const response = await fetch(`${process.env.ASP_EXPORTS_URL}/api/exports/notCompletedTasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                return res.status(response.status).send(message.ASP_MICROSERVICE_ERROR);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            res.setHeader("Content-Disposition", "attachment; filename=not-completed-tasks.docx");
            res.send(buffer);
        }
        catch (error) {
            console.error(error);
            res.status(500).send(message.EXPORT_ERROR);
        }
    })
        .catch((err) => {
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
    await client.connect().catch((err) => {
        return err.message;
    });
    return "ok";
}
//# sourceMappingURL=server.js.map