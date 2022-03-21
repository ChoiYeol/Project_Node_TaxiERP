
const db = require("../db/db_create");
const sql = require("../db/db_exe");
const jwt = require("../auth/jwt_login");
const schedule = require("../Schedule/schedule");

const loader = require("../Dataloader/dataloader");

const logger = require('../Logger/winston');
const log = (msg) => logger.info(msg);

const moment = require("moment");
// require("dotenv").config();

const resolvers = {
  Query: {

    //office paging
    getOfficeInfoPaging: async (_, {
      Search,
      Except,
      Start,
      End,
      ByCol,
      Order,
      First,
      Offset,
      // ExactMatch,
      // GroupBy
    }, req) => { 
      try {
    
        let inputKey = {    
          "Table": "OFFICE_INFO", 
          "Search": Search, //Search : { OS:"OSY001003" }
          "Except": Except, 
          "Start":Start,
          "End":End,
          "ByCol": ByCol,
          "Order": Order,
          "First": First,
          "Offset": Offset,
          // "ExactMatch": ExactMatch,
          // "GroupBy": GroupBy
        };
        log("getOfficeInfoPaging inputKey:" + JSON.stringify(inputKey));
        
        const results = await loader.searchPagingExeLoader.load(inputKey);
        log("getOfficeInfoPaging results:" + JSON.stringify(results));
    
    
        return results;
      } catch (err) {
        logger.error("getOfficeInfoPaging: " + err);
        throw err;
      } finally {
       
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },


    //자동차정보 조회
    getCarsInfoPaging: async (_, {
      Search,
      Except,
      Start,
      End,
      ByCol,
      Order,
      First,
      Offset,
      // ExactMatch,
      // GroupBy
    }, req) => { 
      try {
  
        let inputKey = {
          "Table": "CAR_INFO",
          "Search": Search, //Search : { OS:"OSY001003" }
          "Except": Except, 
          "Start":Start,
          "End":End,
          "ByCol": ByCol,
          "Order": Order,
          "First": First,
          "Offset": Offset,
          // "ExactMatch": ExactMatch,
          // "GroupBy": GroupBy
        };
        log("getCarsInfoPaging inputKey:" + JSON.stringify(inputKey));
        
        const results = await loader.searchPagingExeLoader.load(inputKey);
        log("getCarsInfoPaging results" + JSON.stringify(results));
    
    
        return results;
      } catch (err) {
        logger.error("getCarsInfoPaging: " + err);
        throw err;
      } finally {
       
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },

    //유저정보 조회
    getUsersInfoPaging: async (_, {
      Search,
      Except,
      Start,
      End,
      ByCol,
      Order,
      First,
      Offset,
      // ExactMatch,
      // GroupBy
    }, req) => { 
      try {
  
        let inputKey = {
          "Table" : "USER_INFO",
          "Search": Search,
          "Except": Except,
          "Start": Start,
          "End"  : End,
          "ByCol": ByCol,
          "Order": Order,
          "First": First,
          "Offset": Offset,
          // "ExactMatch": ExactMatch,
          // "GroupBy": GroupBy
        };
        log("getUsersInfoPaging inputKey:" + JSON.stringify(inputKey));
    
        const results = await loader.searchPagingExeLoader.load(inputKey);
        log("getUsersInfoPaging results" + JSON.stringify(results));
    
    
        return results;
      } catch (err) {
        logger.error("getUsersInfoPaging: " + err);
        throw err;
      } finally {
       
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },
    
//////////////////////////// 이 위로 데이터로더 이 아래로 그냥 셀렉


    //실시간 차량목록및 현황 조회z
    getDriveOneMinInfoByMax: async (_, {
      OFFICE_ID
    }, req) => { 
      let conn;
      try {
        
        log("getDriveOneMinInfoByMax start ");
        conn = await db.getPoolConnection();
        const results = await sql.getDriveOneMinInfoByMaxExe(conn,
          OFFICE_ID
        )
        log("getDriveOneMinInfoByMax : " + JSON.stringify(results));

        return results;
      } catch (err) {
        logger.error("getDriveOneMinInfoByMax: " + err);
        throw err;
      } finally {
        if (conn) db.endPoolConnection(conn);
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },

    //실시간 차량목록및 현황 조회z
    getDriverWorkMinMax: async (_, {
      OFFICE_ID,
      ST_DTTI,
      ED_DTTI,

    }, req) => { 
      let conn;
      try { 

          conn = await db.getPoolConnection();
    
          log("getDriverWorkMinMax start ");

          const results = await sql.getDriverWorkMinMaxExe(conn,
            OFFICE_ID,
            ST_DTTI,
            ED_DTTI,
            )

            log("getDriverWorkMinMax : " + JSON.stringify(results)); 
        return results;

      } catch (err) {
        logger.error("getDriverWorkMinMax: " + err);
        throw err;
      } finally {
        if (conn) db.endPoolConnection(conn); 
      }
    },

    
    //실시간 차량목록및 현황 조회z
    getDriveOneMinInfo: async (_, {
      OFFICE_ID,
      ST_DTTI,
      ED_DTTI,
      CAR_NUM,
      DRIVER_ID
    }, req) => { 
      let conn;
      try {
        // console.time("")
        conn = await db.getPoolConnection();
        
          // if(CAR_NUM != null){
          //     DRIVER_ID = await sql.getDriverIdByNameOrCarExe(conn,
          //     CAR_NUM,
          //     NAME);
          // }
          log("getDriveOneMinInfo start ");

          const results = await sql.getDriveOneMinInfoExe(conn,
            OFFICE_ID,
            ST_DTTI,
            ED_DTTI,
            CAR_NUM,
            DRIVER_ID
            )
            log("getDriveOneMinInfo : " + JSON.stringify(results));
          // console.timeEnd("")
        return results;

      } catch (err) {
        logger.error("getDriveOneMinInfo: " + err);
        throw err;
      } finally {
        if (conn) db.endPoolConnection(conn);
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },
 


    // 운행 기록 조회 시퀸스
    getWorkDailySeq: async (_, {
      OFFICE_ID,
      REPORT_TYPE,
      ST_DTTI,
      ED_DTTI,
      ST_REPORT,
      ED_REPORT,
      CAR_NUM,
      DRIVER_ID,
      SEQ_GROUP,
      GROUP_BY,
      ORDER_BY

    }, req) => { 
      let conn;
      try {
  

        //컴온
        log("getWorkDailySeq start ");

        conn = await db.getPoolConnection();
        const results = await sql.getWorkDailySeqExe(conn, 
          OFFICE_ID,
          REPORT_TYPE,
          ST_DTTI,
          ED_DTTI,
          ST_REPORT,
          ED_REPORT,
          CAR_NUM,
          DRIVER_ID,
          SEQ_GROUP,
          GROUP_BY,
          ORDER_BY,
          );
        
        log("getWorkDailySeq results" + JSON.stringify(results));
        return results;
      } catch (err) {
        logger.error("getWorkDailySeq: " + err);
        throw err;
      } finally {
        if (conn) db.endPoolConnection(conn);
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },
    // 운행 기록 조회 시퀸스 합친거
    getTotalbyDriverId: async (_, { 
      OFFICE_ID,
      INPUT_DATA,
    }, req) => { 
      let conn;
      try {
 
        log("getTotalbyDriverId start");

        conn = await db.getPoolConnection();
        const results = await sql.getTotalbyDriverIdExe(conn,
          OFFICE_ID,
          INPUT_DATA
          );
        log("getTotalbyDriverId results" + JSON.stringify(results));
        return results;
      } catch (err) {
        logger.error("getTotalbyDriverId: " + err);
        throw err;
      } finally {
        if (conn) db.endPoolConnection(conn);
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, "getEventsPaging");
      }
    },

  },


  //  구분 
  
  Mutation: {
 
    login: async function (_, {
      ID,
      PW
    }, req) {
      let conn;

      try {
        log("login start");

        conn = await db.getPoolConnection();
        const results = await jwt.loginExe(conn, ID, PW);
        log("user in login : " + JSON.stringify(results));

        return results;
      } catch (err) {
        // sql.insertHistoryExe(req.user.CorpId, req.user.Id, req.user.ip, `login(CorpId:${CorpId}, LoginId:${Id}) Failure`, conn);
        
        logger.error("login: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },
    
    /////////////////// user info down
    insertUserInfo: async (_, {
      OFFICE_ID,
      ROLES,
      ID,
      PW,
      ETC,
      DRIVER_ID,
      JOB_TYPE,
      JOB_POSITION,
      NAME,
      SSN,
      TEL,
      JOB_STATUS,
      CAR_NUM,
      JOIN_DTTI,
      LEAVE_DTTI,
      ADDRESS,
      DRIVER_LICENSE_NUM,
      DRIVER_LICENSE_CREATE,
      LICENSE_NUM,
      LICENSE_CREATE,
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        log("insertUserInfo start");
        // User 등록
        const results = await sql.insertUserInfoExe(
          conn,
          OFFICE_ID,
          ROLES,
          ID,
          PW,
          ETC,
          DRIVER_ID,
          JOB_TYPE,
          JOB_POSITION,
          NAME,
          SSN,
          TEL,
          JOB_STATUS,
          CAR_NUM,
          JOIN_DTTI,
          LEAVE_DTTI,
          ADDRESS,
          DRIVER_LICENSE_NUM,
          DRIVER_LICENSE_CREATE,
          LICENSE_NUM,
          LICENSE_CREATE);
 
        await conn.commit();
        // if (!results.insertId) throw new Error("Nothing inserted");

        log("insertUserInfo results:" + JSON.stringify(results));
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("insertUserInfo: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },

    updateUserInfoByNo: async (_, {
      NO,
      OFFICE_ID,
      ID,
      PW,
      ETC,
      DRIVER_ID,
      JOB_TYPE,
      JOB_POSITION,
      NAME,
      SSN,
      TEL,
      JOB_STATUS,
      CAR_NUM,
      JOIN_DTTI,
      LEAVE_DTTI,
      ADDRESS,
      DRIVER_LICENSE_NUM,
      DRIVER_LICENSE_CREATE,
      LICENSE_NUM,
      LICENSE_CREATE,
    
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        log("updateUserInfoByNo start");
        const results = await sql.updateUserInfoByNoExe(
          conn,
          NO,
          OFFICE_ID,
          ID,
          PW,
          ETC,
          DRIVER_ID,
          JOB_TYPE,
          JOB_POSITION,
          NAME,
          SSN,
          TEL,
          JOB_STATUS,
          CAR_NUM,
          JOIN_DTTI,
          LEAVE_DTTI,
          ADDRESS,
          DRIVER_LICENSE_NUM,
          DRIVER_LICENSE_CREATE,
          LICENSE_NUM,
          LICENSE_CREATE,
        );
        // log(results);
        // await conn.beginTransaction(); await conn.commit(); await conn.rollback();
        await conn.commit();

        log("updateUserInfoByNo results:" + JSON.stringify(results));
        return {
          totalCount: results.affectedRows
        };
      } catch (err) {
        await conn.rollback();
        logger.error("updateUserInfoByNo : " + err);
        throw err;
      } finally {
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, `updateUserByNo(CorpId:${CorpId}, UserId:${Id})`, conn);
        if (conn) await db.endPoolConnection(conn);
      }
    },

    deleteUserInfoByNo: async (_, {
      NO,
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        log("deleteUserInfoByNo start");
        const results = await sql.deleteUserInfoByNoExe(
          conn,
          NO
        );
        await conn.commit();
        log("deleteUserInfoByNo results:" + JSON.stringify(results));
        return {
          totalCount: results.affectedRows
        };
    
      } catch (err) {
        await conn.rollback();
        logger.error("deleteUserInfoByNo : " + err);
        throw err;
      } finally {
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, `deleteUserByNo(CorpId:${CorpId}, UserId:${Id})`, conn);
        if (conn) await db.endPoolConnection(conn);
      }
    },

    /////////////////////////// user info up
    /////////////////////////// car info down
    insertCarInfo: async (_, {
      OFFICE_ID,
      CAR_NUM,
      CAR_NAME,
      CAR_TYPE,
      DRIVE_TYPE,
      DRIVE_MODE,
      VEHICLE_TYPE,
      VEHICLE_YEAR,
      VEHICLE_REG,
      VEHICLE_EXPNG,
      VEHICLE_NUM,
      VEHICLE_INSPECTION_ST,
      VEHICLE_INSPECTION_ED,
      METER_INSPECTION_ST,
      METER_INSPECTION_ED,
      LIABILITY_INSURANCE_ST,
      LIABILITY_INSURANCE_ED,
      COMPRH_INSURANCE_ST,
      COMPRH_INSURANCE_ED,    
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        log("insertCarInfo start : " + CAR_NUM);
        const results = await sql.insertCarInfoExe(
          conn,
          OFFICE_ID,
          CAR_NUM,
          CAR_NAME,
          CAR_TYPE,
          DRIVE_TYPE,
          DRIVE_MODE,
          VEHICLE_TYPE,
          VEHICLE_YEAR,
          VEHICLE_REG,
          VEHICLE_EXPNG,
          VEHICLE_NUM,
          VEHICLE_INSPECTION_ST,
          VEHICLE_INSPECTION_ED,
          METER_INSPECTION_ST,
          METER_INSPECTION_ED,
          LIABILITY_INSURANCE_ST,
          LIABILITY_INSURANCE_ED,
          COMPRH_INSURANCE_ST,
          COMPRH_INSURANCE_ED,
          );
 
 
        await conn.commit();
        // if (!results.insertId) throw new Error("Nothing inserted");
        log("insertCarInfo results:" + JSON.stringify(results));
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("insertCarInfo: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },
    updateCarInfoByNo: async (_, {
      NO,
      CAR_NUM,
      CAR_NAME,
      CAR_TYPE,
      DRIVE_TYPE,
      DRIVE_MODE,
      VEHICLE_TYPE,
      VEHICLE_YEAR,
      VEHICLE_REG,
      VEHICLE_EXPNG,
      VEHICLE_NUM,
      VEHICLE_INSPECTION_ST,
      VEHICLE_INSPECTION_ED,
      METER_INSPECTION_ST,
      METER_INSPECTION_ED,
      LIABILITY_INSURANCE_ST,
      LIABILITY_INSURANCE_ED,
      COMPRH_INSURANCE_ST,
      COMPRH_INSURANCE_ED,
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        log("updateCarInfoByNo start : " + CAR_NUM);
        const results = await sql.updateCarInfoByNoExe(
          conn,
          NO,
          CAR_NUM,
          CAR_NAME,
          CAR_TYPE,
          DRIVE_TYPE,
          DRIVE_MODE,
          VEHICLE_TYPE,
          VEHICLE_YEAR,
          VEHICLE_REG,
          VEHICLE_EXPNG,
          VEHICLE_NUM,
          VEHICLE_INSPECTION_ST,
          VEHICLE_INSPECTION_ED,
          METER_INSPECTION_ST,
          METER_INSPECTION_ED,
          LIABILITY_INSURANCE_ST,
          LIABILITY_INSURANCE_ED,
          COMPRH_INSURANCE_ST,
          COMPRH_INSURANCE_ED,
          );
 
 
        await conn.commit();
        log("updateCarInfoByNo results:" + JSON.stringify(results));
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("updateCarInfoByNo: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },


    deleteCarInfoByNo: async (_, {
      NO,
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();
        log("deleteCarInfoByNo start : " + NO);
        const results = await sql.deleteCarInfoByNoExe(
          conn,
          NO,
          );
 
        await conn.commit();
        log("deleteCarInfoByNo results:" + JSON.stringify(results));
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("deleteCarInfoByNo: " + err);
        throw err;
      } finally {
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, `insertUser(CorpId:${CorpId}, UserId:${Id})`, conn);
        if (conn) await db.endPoolConnection(conn);
      }
    },
 
  //////////////////////////////////////////// carinfo up
  //////////////////////////////////////////// OfficeInfo up
    insertOfficeInfo: async (_, {
      OFFICE_ID,
      OFFICE_NAME,
      CEO_NAME,
      CEO_TEL ,
      FAX ,
      ADDRESS ,
      OFFICE_TYPE ,
      SET_TIME
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        const results = await sql.insertOfficeInfoExe(
          conn,
          OFFICE_ID,
          OFFICE_NAME,
          CEO_NAME,
          CEO_TEL ,
          FAX ,
          ADDRESS ,
          OFFICE_TYPE ,
          SET_TIME
          );

          log("insertOfficeInfo results:" + JSON.stringify(results));
 
          const resultSchedule = await schedule.insertSchedule(
            OFFICE_ID,
            SET_TIME
          );
          log("insertOfficeInfo resultSchedule inserted");
        
        
        await conn.commit();
 
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("insertOfficeInfo: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },

    updateOfficeInfoByOfficeId: async (_, {
      OFFICE_ID,
      OFFICE_NAME,
      CEO_NAME,
      CEO_TEL ,
      FAX ,
      ADDRESS ,
      OFFICE_TYPE ,
      SET_TIME
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        const results = await sql.updateOfficeInfoByOfficeIdExe(
          conn,
          OFFICE_ID,
          OFFICE_NAME,
          CEO_NAME,
          CEO_TEL ,
          FAX ,
          ADDRESS ,
          OFFICE_TYPE ,
          SET_TIME
        );
        log("updateOfficeInfoByOfficeId results:" + JSON.stringify(results));

        // 마감시간 바뀌면 돌아야하는 시간.
        if(SET_TIME){
        const resultSchedule = await schedule.updateScheduleByOfficeId(
          OFFICE_ID,
          SET_TIME,
        );
        }
        log("updateOfficeInfoByOfficeId resultSchedule inserted");

        await conn.commit();
        return {
          totalCount: results.affectedRows
        };
      } catch (err) {
        await conn.rollback();
        logger.error("updateOfficeInfoByOfficeId : " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },

    deleteOfficeInfoByOfficeId: async (_, {
      OFFICE_ID,
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();
     
        const results = await sql.deleteOfficeInfoByOfficeIdExe(
          conn,
          OFFICE_ID
        );
        log("deleteOfficeInfoByOfficeId results:" + JSON.stringify(results));
        const resultSchedule = await schedule.stopScheduledJobs(
          OFFICE_ID
        );
        log("deleteOfficeInfoByOfficeId resultSchedule deleted");
        await conn.commit();
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("deleteOfficeInfoByOfficeId : " + err);
        throw err;
      } finally {

        if (conn) await db.endPoolConnection(conn);
      }
    },
////////// 마감 넣기
    insertClosingDate: async (_, {
      OFFICE_ID,
      SET_TIME ,
      SEQ_GROUP,
      REPORT_DATE,
      ST_DTTI  ,
      ED_DTTI  ,
      CAR_NUM  ,
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();

        // const REG_DTTI = moment().format('YYMMDDHHmmss');
        
        const results = await sql.insertScheduleClosingTimeExe(
          conn     ,
          OFFICE_ID,
          SET_TIME ,
          SEQ_GROUP,
          REPORT_DATE,
          ST_DTTI  ,
          ED_DTTI  ,
          CAR_NUM  ,
          );
          
        // if (!results.insertId) throw new Error("Nothing inserted");
        
        await conn.commit();
        log("insertClosingDate results");
        return {
          totalCount: results
        };

      } catch (err) {
        await conn.rollback();
        logger.error("insertClosingDate: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },

    updateClosingDate: async (_, {
      OFFICE_ID,
      SEQ_GROUP, 
      REPORT_DATE, 
      INPUT_DATA
    }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();
       
 
        // 마감시간 바뀌면 돌아야하는 시간.
        const results = await sql.updateScheduleClosingTimeExe(
          conn,
          OFFICE_ID,
          SEQ_GROUP,
          REPORT_DATE,
          INPUT_DATA
        );
        // await conn.beginTransaction(); await conn.commit(); await conn.rollback();

        await conn.commit();
        log("updateClosingDate results:" +results);
        return {
          totalCount: results
        };
      } catch (err) {
        await conn.rollback();
        logger.error("updateClosingDate : " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },

    
    deleteClosingDate: async (_, {
      NO,
      REPORT_DATE,
      OFFICE_ID,
      SEQ_GROUP,
     }, req) => {
      let conn;
      try {
        conn = await db.getPoolConnection();
        await conn.beginTransaction();
    
        const results = await sql.deleteScheduleClosingTimeExe(
          conn,
          NO,
          REPORT_DATE,
          OFFICE_ID,
          SEQ_GROUP
        );

        await conn.commit();
        log("deleteClosingDate results:" +results);
        return {
          totalCount: results.affectedRows
        };

      } catch (err) {
        await conn.rollback();
        logger.error("deleteClosingDate : " + err);
        throw err;
      } finally {
        // sql.insertHistoryExe(req.user.CorpId, req.user.userId, req.user.ip, `deleteUserByNo(CorpId:${CorpId}, UserId:${Id})`, conn);
        if (conn) await db.endPoolConnection(conn);
      }
    },
  ////////////////////////////////////////////  office  up
   

 
  },
  
  ///////////////////////////////////////////////////////// 호출한 json데이터의 값으로 다시한번 호출
 
  WorkDailySeq: {
    DRIVER_ID: async ({
      DRIVER_ID,
      OFFICE_ID
    }, req) => {
      let conn;
      try {
        
        if(DRIVER_ID == null) return null;
        let inputKey = {
          "DRIVER_ID": DRIVER_ID,
          "OFFICE_ID": OFFICE_ID
        };
        
        const results = await loader.getUsersByDriverIdExeLoader.load(inputKey);
        return results[0];
      } catch (err) {
        logger.error("WorkDailySeq DRIVER_ID error: " + err);
        throw err;
      } finally {
        if (conn) await db.endPoolConnection(conn);
      }
    },
  },
  TotalbyDriverId: {
    DRIVER_ID: async ({
      DRIVER_ID,
      OFFICE_ID
    }, req) => {
      let conn;
      try {
        
        // conn = await db.getPoolConnection();
 
        if(DRIVER_ID == null) return null;
        let inputKey = {
          "DRIVER_ID": DRIVER_ID,
          "OFFICE_ID": OFFICE_ID
        };
        
        const results = await loader.getUsersByDriverIdExeLoader.load(inputKey);
        return results[0];
      } catch (err) {
        logger.error("TotalbyDriverId DRIVER_ID error: " + err);
        throw err;
      } finally {
        // if (conn) await db.endPoolConnection(conn);
      }
    },
  },
  DriveOneMinInfo: {
    DRIVER_ID: async ({
      DRIVER_ID,
      OFFICE_ID
    }, req) => {
      // let conn;
      try {
        
        // conn = await db.getPoolConnection();
        // if(DRIVER_ID == null) return null;

        // const results = await sql.getUsersByDriverIdExe(
        //   conn,
        //   DRIVER_ID
        // );
        if(DRIVER_ID == null) return null;
        let inputKey = {
          "DRIVER_ID": DRIVER_ID,
          "OFFICE_ID": OFFICE_ID
        };
        
        const results = await loader.getUsersByDriverIdExeLoader.load(inputKey);
        return results[0];
      } catch (err) {
        logger.error("DriveOneMinInfo DRIVER_ID error: " + err);
        throw err;
      } finally {
        // if (conn) await db.endPoolConnection(conn);
      }
    },
  }
 
};

module.exports = resolvers;

