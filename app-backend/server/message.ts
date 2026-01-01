"use strict"

export class Message {
    // Server
    SERVER_LISTENING: string = "Server is listening on port"; 
    RESOURCE_NOT_FOUND: string = "Resource not found";

    // Login
    INVALID_CREDENTIALS: string = "Invalid credentials";

    // Parameters
    MISSING_PARAMETERS: string = "Missing parameters";
    MISSING_USERID_PARAMETER: string = "Missing userId parameter";
    MISSING_TASKID_PARAMETER: string = "Missing taskId parameter";
    MISSING_NEWTASK_PARAMETER: string = "Missing newTask parameter";
    MISSING_NEWUSER_PARAMETER: string = "Missing newUser parameter";

    // Database
    DATABASE_ERROR: string = "An error occurred while communicating with the database"
}