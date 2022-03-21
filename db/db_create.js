 
const mariadb = require("mariadb");
 
const config = require("./db_config");
 
const logger = require('../Logger/winston');

const log = (msg) => logger.info(msg);

 
const pool = mariadb.createPool({
    connectionLimit: config.connectionLimit,
 
    acquireTimeout: config.acquireTimeout,
 
    host: config.host,
 
    user: config.user,
    password: config.password,
    database: config.database,
    allowPublicKeyRetrieval: true 
});



module.exports = {
    exe: async function (queryStatement) {
        let conn;
        let result;

        try {
            try {
                // conn = await pool.getConnection();

                conn = await this.getPoolConnection();
                // log("connected ! connection id: " + conn.threadId + " -----");
            } catch (err) {
                console.error("not connected due to error : " + err);
                logger.error("not connected due to error : " + err);
                throw err;
            }

            try {
                result = await conn.query(queryStatement);
                // result = await pool.query(queryStatement);

                // log("exe queryStatement: " + queryStatement);
                // log("queryStatement: " + queryStatement);

                // log("result : " + result);
                return result;
            } catch (err) {
                console.error("conn.query error: " + err);
                logger.error("conn.query error: " + err);
                throw err;
                // result = "null";getDecryptPWByKeyPWExe
            }
        } catch (err) {
            console.error("exe main catch error : " + err);
            logger.error("exe main catch error : " + err);
            throw err;
        } finally {
            // log("exe Disconnected ! connection id: " + conn.threadId + " !!!!!!");

            // if (conn) conn.end();

            try {
                if (conn) await this.endPoolConnection(conn);
            } catch (err) {
                console.error("sql.exe this.endPoolConnection error : " + err);
                logger.error("sql.exe this.endPoolConnection error : " + err);
                throw err;
            }
        }
    },

    exeTransaction: async function (conn, queryStatement) {
        try {
            // log("exeTransaction->conn: " + JSON.stringify(conn));

            const result = await conn.query(queryStatement);
            log("exeTransaction->queryStatement: " + queryStatement);
            return result;
        } catch (err) {
            log("exeTransaction->conn.query error: " + err);
            throw err;
        }
    },

    getPoolConnection: async function () {
        let conn;
        let result;
        try {
            conn = await pool.getConnection();
            log("connected ! connection id: " + conn.threadId + " -----");
            return conn;
        } catch (err) {
            log("getPoolConnection not connected due to error : " + err);
            throw err;
        }
    },

    endPoolConnection: async function (conn) {
        try {
            if (conn) {
                await conn.end();
                log(
                    "exe Disconnected ! connection id: " + conn.threadId + " !!!!!!"
                );
            }
        } catch (err) {
            log("connection ending error : " + err);
            throw err;
        }
    }

};