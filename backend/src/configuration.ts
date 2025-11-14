"use strict"

export class Configuration {
    port: number = 3000;
    connectionString: string = "mongodb://localhost:27017";
    dbName = "keep_in_mind";
    postParametersSize: string = "5mb";
}