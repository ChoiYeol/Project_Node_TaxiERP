
const schedule = require("node-schedule");
const moment = require("moment");

const db = require("../db/db_create");
const sql = require("../db/db_exe");
const loader = require("../Dataloader/dataloader");
const logger = require("../Logger/winston");
const log = (msg) => logger.info(msg);
require("dotenv").config();

// const pubsub = require("../WebSock/pubsub");
// let redisPubClient = pubsub.getRedisPubClient();

module.exports = {
    // myEvent,
    runSchedule: async function (
        OFFICE_ID, // unique office no. no of office_info Table. use for cancel.
        SET_TIME, // closing time. set_time of office_info Table. use for cancel.
        SEQ_GROUP,
        // ST_DTTI,
        // ED_DTTI,
        // CAR_NUM,
    ) {
        let conn;
        try {
            
            let scheduler;
            if (!(OFFICE_ID || SET_TIME))
                throw new Error("Schedule parameters needed");
            // let a = (SET_TIME=='00')?57:48;
            // let duration = `*/5 * * * * *`; 
            let duration = `00 00 ${SET_TIME} * * *`; 
            // if (RepeatRule || endTime) duration = {
            //     start: startTime,
            //     end: endTime,
            //     rule: RepeatRule
            // };
            // else duration = startTime;

            scheduler = schedule.scheduleJob(
                OFFICE_ID,
                // {
                //     start: startTime,
                //     end: endTime,
                //     rule: RepeatRule
                // },
                duration,
                async function () {

                        conn = await db.getPoolConnection(); 
                        await conn.beginTransaction();

                        log(moment().format() + " - OFFICE_ID:" + OFFICE_ID +" "+SEQ_GROUP+" is running");

                            // console.log( OFFICE_ID+" "+SET_TIME+" "+duration );
                            const results = await sql.insertScheduleClosingTimeExe(
                                conn,
                                OFFICE_ID,
                                SET_TIME,
                                SEQ_GROUP,
                                // ST_DTTI,
                                // ED_DTTI,
                                // CAR_NUM,
                            );
                        
                        log("setScheduleClosingTimeExe results:" + JSON.stringify(results));
                
                        await conn.commit();
                        if (conn) await db.endPoolConnection(conn);

                }.bind(null, OFFICE_ID, SET_TIME, SEQ_GROUP)
            );
            
            // console.log(moment().format() + " - NameepeatRule:" + RepeatRule + " is registered...");
            // log(moment().format() + " -  RepeatRule:" + RepeatRule + " is registered...");
 
            return scheduler;
        } catch (err) {
            logger.error("runSchedule: ", err)
            throw err;
        } 
    },
 
    // Schedules Table의 모든 스케줄 실행. 주로 node.js 시작시에 실행.
    batchSchedule: async function () {
        try {
 
              let inputKey = {
                "Table": "OFFICE_INFO", 
                "ByCol": "OFFICE_ID", 
              };

            const resultsSchedules = await loader.searchPagingExeLoader.load(inputKey);
         
            // console.log("There are " + resultsSchedules.totalCount + " scheduled jobs...");

            for (let i = 0; i < resultsSchedules.length; i++) {
                if(resultsSchedules[i].OFFICE_ID !='0000000000')
                {
                    this.runSchedule(
                        resultsSchedules[i].OFFICE_ID,
                        resultsSchedules[i].SET_TIME,
                        "기본"
                    );
                }
            }
            // console.log("asdfg");
        } catch (err) {
            logger.error("batchSchedule: ", err)
            throw err;
        }
    },

    getScheduledJobs: async function (OFFICE_ID = null) {
        if (OFFICE_ID) {
            const job = schedule.scheduledJobs[OFFICE_ID];

            if (job === undefined) {
                return false;
            }
            return job;
        } else return false;
        
    },
    stopScheduledJobs: async function (OFFICE_ID = null) {
        try {
            const job = schedule.scheduledJobs[OFFICE_ID];
            // console.log("stopScheduledJobs job:" + JSON.stringify(job));
            if (!job){
                throw new Error("No Scheduled Job to stop.");
            }

            const jobCancel = job.cancel();
 
            return jobCancel;

        } catch (err) {
            throw err;
        }
    },
    insertSchedule: async function (
        OFFICE_ID = null,
        SET_TIME = null,
    ) {
        try {
            const result = await this.runSchedule(
                OFFICE_ID,
                SET_TIME,
                "기본",
            );
            return result;
        } catch (err) {
            throw err;
        }
    },

    updateScheduleByOfficeId: async function (
        OFFICE_ID = null,
        SET_TIME = null,
    ) {
        try {
 
            // Schedule 확인
            const resultGetSchedule = await this.getScheduledJobs(OFFICE_ID);
            // Schedule 있을 때 취소(중복 실행 방지)
            let jobCancel;
            if (resultGetSchedule != false) jobCancel = await this.stopScheduledJobs(OFFICE_ID);
            // Schedule 없거나 취소완료 되면 시작
            if(jobCancel == true || resultGetSchedule == false){
                this.runSchedule(
                    OFFICE_ID,
                    SET_TIME,
                    "기본"
                )
            }else{
                console.log("No schedule to work.")
            }
            
            return 1;
        } catch (err) {
            console.error("updateScheduleByNo: " + err);
            throw err;
        }
    },

    // 안쓸거지만 코드상 존재하는 스케줄러
    deleteScheduleByNoExe: async function (
        conn = null,
        OFFICE_ID = null,
    ) {
        try {
            const resultGetSchedule = await this.getScheduledJobs(OFFICE_ID);
            // console.log("temp:" + temp);
            if (resultGetSchedule)
                await this.stopScheduledJobs(OFFICE_ID);

            return results;

        } catch (err) {
            console.log("deleteScheduleByNoExe: " + err);
            throw err;
        }
    },
};