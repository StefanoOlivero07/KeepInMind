"use strict"

export class Configuration {
    port: number = 3000;
    connectionString: string = "mongodb://localhost:27017";
    dbName = "keep_in_mind";
    dbCollection = "users";
    postParametersSize: string = "5mb";
}

export class ServerMessages {
    missingParameters: string = "Missing parameters";
    invalidCredentials: string = "Invalid credentials";
    databaseConnectionRefused: string = "Database connection refused";
    queryError: string = "Query error: ";
}