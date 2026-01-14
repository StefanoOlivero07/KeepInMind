"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
class Message {
    // Server
    SERVER_LISTENING = "Server is listening on port";
    RESOURCE_NOT_FOUND = "Resource not found";
    // Login
    INVALID_CREDENTIALS = "Invalid credentials";
    // Parameters
    MISSING_PARAMETERS = "Missing parameters";
    MISSING_USERID_PARAMETER = "Missing userId parameter";
    MISSING_TASKID_PARAMETER = "Missing taskId parameter";
    MISSING_NEWTASK_PARAMETER = "Missing newTask parameter";
    MISSING_NEWUSER_PARAMETER = "Missing newUser parameter";
    // Database
    DATABASE_ERROR = "An error occurred while communicating with the database";
    // Exports
    ASP_MICROSERVICE_ERROR = "Error from ASP microservice";
    EXPORT_ERROR = "Error during export";
}
exports.Message = Message;
//# sourceMappingURL=message.js.map