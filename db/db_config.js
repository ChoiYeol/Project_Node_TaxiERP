
require("dotenv").config();

module.exports = (function () {
    return {
        connectionLimit: 50, // default 10
        // connectTimeout: 100, //20000, default 10000(10sec)
        acquireTimeout: 50000, //Timeout to get a new connection from pool in ms. default 10000(10sec)
        // idleTimeoutMillis: 300,
        waitForConnections: true, //default true
        host: process.env.dbServer || "localhost",
        user: process.env.dbUser || "taxi",
        password: process.env.dbPW || "0814",
        database: process.env.dbName || "TAXIDB"
    };
})();