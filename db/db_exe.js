// if select query, we can use somethinke like results.length & results[0].No.
// if insert, update, delete query, then results.affectedRows.
// if insert query, then results.InsertId.
// if update query, then results.changedRows.

// npm install mariadb
// npm install bcryptjs

// const mariadb = require("mariadb");
const db = require("./db_create");

// const bcrypt = require("bcryptjs");
// const crypto = require("crypto");
const encrypt_pw = require("../auth/encrypt_pw");
const moment = require("moment");
// const pathlib = require("path");
// const multiWsServer = require("../WebSock/multiWSServer");

// const {
//     spawn
// } = require('child_process');
// const watcher = require("../FolderWatch/watcher");
// const schedule = require("../Schedule/schedule");
const logger = require('../Logger/winston');
const log = (msg) => logger.info(msg);
// const fs = require("fs");
 


module.exports = {

//yeol added down line------------------------------------------
// getUsersByDriverIdExe: async function (
//     DRIVER_ID) {
//     try {
//         const queryString =
//         "SELECT  * FROM USER_INFO ";
    
//         let results = await db.exe(queryString);

//         let resultsFilterd = results.filter(
//             (user) => DRIVER_ID.includes(user.DRIVER_ID)
//         );

//         return resultsFilterd;
//     } catch (err) {
//         //  console.error("error is " + err);
//         logger.error("getUsersByDriverIdExe: " + err);
//         throw new Error(err);
//     }
// },
 
getUsersByDriverIdExe: async function (
    DRIVER_ID, OFFICE_ID) {
    try {
      

        let inArray1 = DRIVER_ID.toString().split(","); 


        let inArrayAll = [];
        for (let i in inArray1) {
            inArray1[i] = JSON.stringify(inArray1[i]); 
            let newItem = " " + inArray1[i] + " ";
            inArrayAll = [...inArrayAll, newItem];
        }

        const queryString =
            "SELECT  * FROM USER_INFO WHERE OFFICE_ID = '"+OFFICE_ID+"' and "+
            "( DRIVER_ID ) in (" + inArrayAll.join() + ")";

        let results = await db.exe(queryString);
        // if (!conn) results = await db.exe(queryString);
        // else results = await db.exeTransaction(conn, queryString);
        // log(results);
        return results;
    } catch (err) {
        //  console.error("error is " + err);
        logger.error("getUsersByDriverIdExe: " + err);
        throw new Error(err);
    }
},
 

//////////???????????? ???????????? ?????? ????????? ???????????? ????????? ???///////////////////////


searchPagingExe: async function (
    Table = null,
    Search = null,
    Except = null,
    Start = null,
    End = null,
    ByCol = null,
    Order = "DESC",
    First = 0,
    Offset = 1000000,
    // ExactMatch = false, ???????????? ??????????????????.
    // GroupBy = null ??? ????????? ???????????? ???????????????.
) {
    try {

        let queryString = `select SQL_CALC_FOUND_ROWS * from  ${Table}  where 0=0 `;
        for (let key in Search) {
            if(Search) queryString += ` and ${key} like '%${Search[key]}%'  `;
        }
        for (let key in Except) {
            if(Except) queryString += ` and ${key} not like '%${Except[key]}%'  `;
        }
        
        // if (GroupBy) {
        //     statement = statement + " group by " + GroupBy;
        // }


        if(Start && End){ //?????? ??????
            queryString += ` and Time between Start and End `;
        }else if(Start){
            queryString += ` and Time >= Start `;
        }else if(End){
            queryString += ` and Time >= End `;
        }
        if(ByCol && Order)queryString += ` order by ${ByCol} ${Order} `;
        queryString += ` Limit ${First}, ${Offset} `;
        const results = await db.exe(queryString);
        log("results: " + JSON.stringify(results));

        return results;
    } catch (err) {
        //  console.error("error is " + err);
        throw new Error(err);
    }
},


    // getSearch: async function(
    //     table = null,
    // ){
    //     try{
    //         let queryString = `SELECT *FROM DRIVE_1MIN_INFO WHERE CAR_NUM = ${conn.escape(OFFICE_ID)} 
    //             AND DRIVER_ID=  ${conn.escape(OFFICE_ID)} 
    //             AND INFO_DTTI between  ${conn.escape(OFFICE_ID)}  AND  ${conn.escape(OFFICE_ID)} ;`;

    //             const results = await db.exeTransaction(conn, queryString);
    //             return results;
    //     } catch (err) {
    //         //  console.error("error is " + err);
    //         throw new Error(err);
    //     }
    // },

    getDriverWorkMinMaxExe: async function(
        conn = null,
        OFFICE_ID= null, 
        ST_DTTI= null, 
        ED_DTTI= null, 
    ){
        try{
        
            let queryString = `SELECT CAR_NUM, DRIVER_ID, MIN(BC_DTTI) as BC_DTTI, MAX(BC_DTTI) as P_DTTI FROM WORK_DAILY_SEQ where DRIVER_ID is not null and `+
            ` OFFICE_ID = ${conn.escape(OFFICE_ID)} and`+
            ` BC_DTTI >= ${conn.escape(ST_DTTI)} and `+
            ` BC_DTTI <= ${conn.escape(ED_DTTI)} group by DRIVER_ID order by no desc `;

            const results = await db.exeTransaction(conn, queryString);

            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        }
    },

    getDriveOneMinInfoByMaxExe: async function(
        conn = null,
        OFFICE_ID= null, 
    ){
        try{
        
            

            let queryOfficeString = `SELECT * FROM DRIVE_1MIN_INFO WHERE OFFICE_ID = ${conn.escape(OFFICE_ID)} `; 
            const resultOffice = await db.exeTransaction(conn, queryOfficeString); 

            let current = moment().format(`YYMMDD`); 
            // let a = "select * From DRIVE_1MIN_INFO a , (select  MAX(INFO_DTTI) as MAX_INFO from DRIVE_1MIN_INFO where INFO_DTTI 
            // like '211210%' GROUP BY CAR_NUM) b where a.INFO_DTTI = b.MAX_INFO 
            let queryString = `SELECT a.* FROM`+ 
            ` DRIVE_1MIN_INFO a,  (select  MAX(INFO_DTTI) as MAX_INFO, CAR_NUM from DRIVE_1MIN_INFO where INFO_DTTI like ${conn.escape(current+'%')} `;
            
            if(resultOffice.length>0){
                queryString += ` and OFFICE_ID = ${conn.escape(OFFICE_ID)} `;
                // GROUP BY CAR_NUM 
            }else{
                // queryString += ` GROUP BY CAR_NUM `;
            }

            queryString += ` GROUP BY CAR_NUM) b WHERE  a.INFO_DTTI = b.MAX_INFO and a.CAR_NUM = b.CAR_NUM ;`; 
            
            const results = await db.exeTransaction(conn, queryString);

            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        }
    },
    getDriveOneMinInfoExe: async function(
        conn = null,
        OFFICE_ID = null, 
        ST_DTTI = null, 
        ED_DTTI = null, 
        CAR_NUM= null, 
        DRIVER_ID= null, 
    ){
        try{
            let queryString = `SELECT INFO_DTTI, CAR_NUM, DRIVER_ID, SPEED, DIST, CAR_X, CAR_Y, STATE, IFNULL(OFFICE_ID, '1378107115') as OFFICE_ID FROM DRIVE_1MIN_INFO WHERE 0=0 `+
            ` AND INFO_DTTI >= ${conn.escape(ST_DTTI)} `+
            ` AND INFO_DTTI <= ${conn.escape(ED_DTTI)} `;

 
            let OFFICE_ID_CNT = await db.exeTransaction(conn, `SELECT OFFICE_ID FROM DRIVE_1MIN_INFO WHERE OFFICE_ID = ${conn.escape(OFFICE_ID)} `);
            if(OFFICE_ID_CNT.length>0){
                if(OFFICE_ID) queryString +=` AND OFFICE_ID = ${conn.escape(OFFICE_ID)} `;
            }
            if(CAR_NUM)     queryString +=` AND CAR_NUM = ${conn.escape(CAR_NUM)} `;
            if(DRIVER_ID)   queryString +=` AND DRIVER_ID = ${conn.escape(DRIVER_ID)} `;
            
            // let DRIVERS_ID=[];
            // DRIVERS_ID.length&&DRIVER_ID.map((data, index)=>{
            //     let DRIVER_ID_DATA = data.DRIVER_ID;
            //     DRIVERS_ID= DRIVERS_ID.concat(DRIVER_ID_DATA);
            // })
            // if(DRIVERS_ID.length != 0){
            //     queryString += ` AND DRIVER_ID IN (${DRIVERS_ID.toString()}) `
            // }
            const results = await db.exeTransaction(conn, queryString);
            // console.log(results);
            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        }
    },

  
    getWorkDailySeqExe: async function(
        conn = null, 
        OFFICE_ID = null,
        REPORT_TYPE = null,
        ST_DTTI = null,
        ED_DTTI = null,
        ST_REPORT = null,
        ED_REPORT = null,
        CAR_NUM = null,
        DRIVER_ID = null,
        SEQ_GROUP = null,
        GROUP_BY = null,
        ORDER_BY = null,
    ){
        try{
            let queryString = `SELECT * FROM WORK_DAILY_SEQ WHERE `+
                                ` OFFICE_ID =  ${conn.escape(OFFICE_ID)} AND ` +
                                ` P_DTTI IS NOT NULL ` ;


            if(ST_REPORT && ED_REPORT){
                queryString += `AND REPORT_DATE >= ${conn.escape(ST_REPORT)} AND REPORT_DATE <= ${conn.escape(ED_REPORT)}  `;
               
            }else{
                if(REPORT_TYPE=="setoff" || REPORT_TYPE=="setdri"){ 
                    queryString += `AND BC_DTTI   >= ${conn.escape(ST_DTTI)} AND  BC_DTTI   <= ${conn.escape(ED_DTTI)}  `;
                }else{
                    queryString += `AND DV_DTTI   >= ${conn.escape(ST_DTTI)} AND  P_DTTI   <= ${conn.escape(ED_DTTI)}  `;
                }
            }

            if(CAR_NUM)     queryString +=` AND CAR_NUM = ${conn.escape(CAR_NUM)} `;
            if(DRIVER_ID)   queryString +=` AND DRIVER_ID = ${conn.escape(DRIVER_ID)} `;
            
            if(REPORT_TYPE=="setoff" || REPORT_TYPE=="setdri"){ 
                queryString +=` AND REPORT_TYPE = ${conn.escape(REPORT_TYPE)} `;
                if(SEQ_GROUP){
                    queryString +=` AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} `; 
                }
            }else if(REPORT_TYPE=="drive" || REPORT_TYPE=="empty"){ 
                queryString +=` AND REPORT_TYPE = ${conn.escape(REPORT_TYPE)} `;
                queryString +=` AND TIMESTAMPDIFF(MINUTE, DATE_FORMAT(DV_DTTI, '%y%m%d%H%i%s'), DATE_FORMAT(P_DTTI, '%y%m%d%H%i%s') ) < 360 `
            }else{          
                queryString +=` AND (REPORT_TYPE = 'drive' OR REPORT_TYPE = 'empty' ) `; 
                queryString +=` AND TIMESTAMPDIFF(MINUTE, DATE_FORMAT(DV_DTTI, '%y%m%d%H%i%s'), DATE_FORMAT(P_DTTI, '%y%m%d%H%i%s') ) < 360 `; 
            }

            if(GROUP_BY)   queryString +=` GROUP BY ${GROUP_BY} `;

            if(ORDER_BY){
                queryString +=` ORDER BY ${ORDER_BY} `;
            }else{
                queryString +=` ORDER BY BC_DTTI `;
            }

            // if(!ED_DTTI){
            //     queryString = `SELECT * FROM WORK_DAILY_REPORT_SEQ WHERE 0=0 AND `+
            //                     `OFFICE_ID = ${conn.escape(OFFICE_ID)} AND`+
            //                     `REPORT_DATE = ${conn.escape(ST_DTTI)} `+
            //                     `GROUP BY DRIVER_ID;`;
            // }
            const results = await db.exeTransaction(conn, queryString);
            return results;
        } catch (err) {
            throw new Error(err);
        }
    },

    getTotalbyDriverIdExe: async function(
        conn = null, 
        OFFICE_ID = null, 
        INPUT_DATA = [],
    ){
        try{
  
            let results=[];
     
            for(let i = 0; i<INPUT_DATA.length; i++){

                let queryString = ` SELECT DRIVER_ID, OFFICE_ID, CAR_NUM, ${conn.escape(INPUT_DATA[i].ED_DTTI)} as ED_DTTI, ${conn.escape(INPUT_DATA[i].ST_DTTI)} as ST_DTTI, sum(FARE+ADD_FARE+TIME_EXTRA_FARE) as ALL_FARE, sum(WORK_DIST) AS WORK_DIST, `+
                ` sum(BLANK_DIST) AS BLANK_DIST, `+
                
                `(select  SUM(TIMESTAMPDIFF(SECOND, DATE_FORMAT(DV_DTTI, '%y%m%d%H%i%s'), DATE_FORMAT(P_DTTI, '%y%m%d%H%i%s') )) `+
                ` from WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)} AND `+
                ` REPORT_TYPE = 'empty' and TIMESTAMPDIFF(MINUTE, DATE_FORMAT(DV_DTTI, '%y%m%d%H%i%s'), DATE_FORMAT(P_DTTI, '%y%m%d%H%i%s') ) < 360 ) as EMPTY_TIME, `+

                ` (select SUM(TIMESTAMPDIFF(SECOND, DATE_FORMAT(DV_DTTI, '%y%m%d%H%i%s'), DATE_FORMAT(P_DTTI, '%y%m%d%H%i%s') )) `+
                ` from WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)} AND `+
                ` REPORT_TYPE = 'drive' ) as DRIVE_TIME, `+

                ` (SELECT SUM(FARE+ ADD_FARE) FROM  WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)} `+
                ` AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)} AND PAYTYPE= 1 AND (REPORT_TYPE = 'empty' OR REPORT_TYPE = 'drive')) as CASH,`+

                ` (SELECT SUM(FARE+ ADD_FARE) FROM  WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND`+
                ` DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)} AND PAYTYPE= 2 AND (REPORT_TYPE = 'empty' OR REPORT_TYPE = 'drive')) as CARD,`+  

                ` (SELECT SUM(TIME_EXTRA_FARE) FROM  WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} `+
                ` AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND (REPORT_TYPE = 'empty' OR REPORT_TYPE = 'drive')) as EXTRA, `+

                ` (SELECT COUNT(*) FROM  WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} `+ 
                ` AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)}  AND REPORT_TYPE = 'drive' AND P_DTTI is not null ) as DRIVE_CNT, `+ 

                ` (SELECT COUNT(*) FROM  WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} AND `+ 
                ` P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND REPORT_TYPE = 'drive' AND ADD_FARE != 0 AND P_DTTI is not null) as ADD_DRIVE_CNT, `+ 

                ` (SELECT COUNT(*) FROM  WORK_DAILY_SEQ WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} `+ 
                ` AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)}  AND OFFICE_ID = ${conn.escape(OFFICE_ID)}  AND REPORT_TYPE = 'drive' AND TIME_EXTRA_FARE != 0 AND P_DTTI is not null) as EXTRA_CNT `+ 

                ` FROM WORK_DAILY_SEQ  WHERE DRIVER_ID = ${conn.escape(INPUT_DATA[i].DRIVER_ID)} AND DV_DTTI >= ${conn.escape(INPUT_DATA[i].ST_DTTI)} AND P_DTTI <= ${conn.escape(INPUT_DATA[i].ED_DTTI)} AND `+ 
                `  (REPORT_TYPE = 'empty' OR REPORT_TYPE = 'drive') AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND P_DTTI is not null order by NO desc  `; 
                console.log(queryString)
                let result = await db.exeTransaction(conn, queryString);
            
                results.push(result[0]);
            
            }
            return results;
        } catch (err) {
            throw new Error(err);
        }
    },

    
///////////////////////////////////////////  ??? ?????? ?????? ??? ????????? ?????? ??????  //////////////////////////////////////////////////

    //office cud  
    insertOfficeInfoExe: async function (
        conn = null,
        OFFICE_ID = null,
        OFFICE_NAME = null,
        CEO_NAME = null,
        CEO_TEL = null,
        FAX = null,
        ADDRESS = null,
        OFFICE_TYPE = null,
        SET_TIME = null,
    ) {
    try {   
            // check same id and name
            const queryStringOfficeCheck = `SELECT * FROM OFFICE_INFO WHERE OFFICE_ID = ${conn.escape(OFFICE_ID)} OR OFFICE_NAME = ${conn.escape(OFFICE_NAME)} `;
            const resultOfficeCheck = await db.exeTransaction(conn, queryStringOfficeCheck);

            if(resultOfficeCheck.length)throw new Error("The ID or Name already exists"); 
            // check same id and name
            const queryString =
            "insert into OFFICE_INFO " +
            " ( OFFICE_ID, OFFICE_NAME, CEO_NAME, CEO_TEL, FAX, ADDRESS, OFFICE_TYPE, SET_TIME )" +
            "values ( " + conn.escape(OFFICE_ID) +
            ", " + conn.escape(OFFICE_NAME) +
            ", " + conn.escape(CEO_NAME) +
            ", " + conn.escape(CEO_TEL) +
            ", " + conn.escape(FAX) +
            ", " + conn.escape(ADDRESS) +
            ", " + conn.escape(OFFICE_TYPE) +
            ", " + conn.escape(SET_TIME) +
            ") "

            const results = await db.exeTransaction(conn, queryString);
            return results;
        } catch (err) {
         throw err;
        }
    },

    //  ?????????  ?????? ??????????????? ??????
    updateOfficeInfoByOfficeIdExe: async function (
        conn = null,
        OFFICE_ID = null,
        OFFICE_NAME = null,
        CEO_NAME = null,
        CEO_TEL = null,
        FAX = null,
        ADDRESS = null,
        OFFICE_TYPE = null,
        SET_TIME = null,
        
    ) {
        try {


            // check same id  
            // if(OFFICE_ID){
            //     const queryStringOfficeIdCheck = `SELECT * FROM OFFICE_INFO WHERE OFFICE_ID = ${conn.escape(OFFICE_ID)} `;
            //     const resultOfficeIdCheck = await db.exeTransaction(conn, queryStringOfficeIdCheck);
            //     if(resultOfficeIdCheck.length)throw new Error("The OFFICE_ID or already exists"); 
            // }
            // check same   name
            if(OFFICE_NAME){
                const queryStringOfficeNameCheck = `SELECT * FROM OFFICE_INFO WHERE  OFFICE_NAME = ${conn.escape(OFFICE_NAME)} AND OFFICE_ID != ${conn.escape(OFFICE_ID)} `;
                const resultOfficeNameCheck = await db.exeTransaction(conn, queryStringOfficeNameCheck);
                if(resultOfficeNameCheck.length)throw new Error("The OFFICE_NAME already exists");
            } 

            let queryString = "UPDATE OFFICE_INFO SET ";
                if(OFFICE_NAME) queryString+= "OFFICE_NAME = NULLIF(" + conn.escape(OFFICE_NAME) + ", null)," ;
                if(CEO_NAME)    queryString+= "CEO_NAME = NULLIF(" + conn.escape(CEO_NAME) + ", null)," ;
                if(CEO_TEL)     queryString+= "CEO_TEL = NULLIF(" + conn.escape(CEO_TEL) + ", null)," ;
                if(FAX)         queryString+= "FAX = NULLIF(" + conn.escape(FAX) + ", null)," ;
                if(ADDRESS)     queryString+= "ADDRESS = NULLIF(" + conn.escape(ADDRESS) + ", null)," ;
                if(OFFICE_TYPE) queryString+= "OFFICE_TYPE = NULLIF(" + conn.escape(OFFICE_TYPE) + ", null)," ;
                if(SET_TIME)    queryString+= "SET_TIME = NULLIF(" + conn.escape(SET_TIME) + ", null), " ;
                queryString += " OFFICE_ID = " + conn.escape(OFFICE_ID) +" WHERE OFFICE_ID = "+conn.escape(OFFICE_ID)+" ";

            const results = await db.exeTransaction(conn, queryString);
            log("updateOfficeInfoByOfficeIdExe affectedRows:" + results.affectedRows);
            // log(results);
            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        } 
    },

    //  ????????? ?????? ??????
    deleteOfficeInfoByOfficeIdExe: async function (
        conn,
        OFFICE_ID,
    ) {
        try {
            const queryString =
                "DELETE from OFFICE_INFO " +
                "WHERE OFFICE_ID = " + conn.escape(OFFICE_ID) +" ";
            const results = await db.exeTransaction(conn, queryString);
 
            return results;
        } catch (err) {
            log("deleteEventSettingExe: " + err);
            throw err;
        } 
    },
    //  ????????? ??????
    insertUserInfoExe: async function (
        conn = null,
        OFFICE_ID = null,
        ROLES = null,
        ID = null,
        PW = null,
        ETC = null,
        DRIVER_ID = null,
        JOB_TYPE = null,
        JOB_POSITION = null,
        NAME = null,
        SSN = null,
        TEL = null,
        JOB_STATUS = null,
        CAR_NUM = null,
        JOIN_DTTI = null,
        LEAVE_DTTI = null,
        ADDRESS = null,
        DRIVER_LICENSE_NUM = null,
        DRIVER_LICENSE_CREATE = null,
        LICENSE_NUM = null,
        LICENSE_CREATE = null,
    ) {
    try {
            // OFFICE_ID ??? ???????????? ??????
            if(OFFICE_ID || OFFICE_ID =='' ){
                
            const queryStringOfficeIdCheck = `SELECT * FROM OFFICE_INFO WHERE  OFFICE_ID = ${conn.escape(OFFICE_ID)}  `;
            const resultOfficeIdCheck = await db.exeTransaction(conn, queryStringOfficeIdCheck);
            if(resultOfficeIdCheck.length == 0)throw new Error("?????? ??????????????? ???????????? ????????????."); 
            }

            // ????????? ??????????????? ?????? ?????????  ?????? x  ????????? ??????
            if(ROLES == 'admin'){
                if(ROLES == 'admin' && OFFICE_ID == '' )throw new Error("OFFICE_ID??? ??????????????????.");
                const queryStringOfficeIdROLESCheck = `SELECT * FROM USER_INFO WHERE ROLES = ${conn.escape(ROLES)} AND OFFICE_ID = ${conn.escape(OFFICE_ID)}  `;
                const resultOfficeIdROLESCheck = await db.exeTransaction(conn, queryStringOfficeIdROLESCheck);
                if(resultOfficeIdROLESCheck.length > 0)throw new Error("?????? ????????? ??????????????? ????????? ???????????????."); 
            }
            // ????????? ?????????????????? ?????? ?????????  ?????? x  ????????? ??????
            if(ROLES == 'user'){ 
                const queryStringOfficeIdROLESCheck = `SELECT * FROM USER_INFO WHERE ROLES = ${conn.escape(ROLES)} AND OFFICE_ID = ${conn.escape(OFFICE_ID)}` +
                ` AND DRIVER_ID = ${conn.escape(DRIVER_ID)}   `;
                const resultOfficeIdROLESCheck = await db.exeTransaction(conn, queryStringOfficeIdROLESCheck);
                if(resultOfficeIdROLESCheck.length > 0)throw new Error("?????? ????????? ?????????????????? ???????????????."); 
            }

            if(ROLES == 'admin'){
                if(ROLES == 'admin' && ID == '')throw new Error("???????????? ??????????????????.");
            const queryStringUserCheck = `SELECT * FROM USER_INFO WHERE  ID = ${conn.escape(ID)} `;
            const resultUserCheck = await db.exeTransaction(conn, queryStringUserCheck);
            if(resultUserCheck.length > 0)throw new Error("?????? ????????? ???????????? ???????????????.");
            }
            
            // check same id 
            let encryptedPW = PW&&await encrypt_pw.encryptUserPW(PW);

            const queryString =
            "INSERT INTO USER_INFO " +
            " ( OFFICE_ID, ROLES, ID, PW, ETC, DRIVER_ID, JOB_TYPE, JOB_POSITION, NAME, SSN, TEL, JOB_STATUS, CAR_NUM, JOIN_DTTI, LEAVE_DTTI, "+
             "ADDRESS, DRIVER_LICENSE_NUM, DRIVER_LICENSE_CREATE, LICENSE_NUM, LICENSE_CREATE )" +
            "values ( " + conn.escape(OFFICE_ID) +
            ", " + conn.escape(ROLES) +
            ", " + conn.escape(ID) +
            ", " + conn.escape(encryptedPW) +
            ", " + conn.escape(ETC) +
            ", " + conn.escape(DRIVER_ID) +
            ", " + conn.escape(JOB_TYPE) +
            ", " + conn.escape(JOB_POSITION) +
            ", " + conn.escape(NAME) +
            ", " + conn.escape(SSN) +
            ", " + conn.escape(TEL) +
            ", " + conn.escape(JOB_STATUS) +
            ", " + conn.escape(CAR_NUM) +
            ", " + conn.escape(JOIN_DTTI) +
            ", " + conn.escape(LEAVE_DTTI) +
            ", " + conn.escape(ADDRESS) +
            ", " + conn.escape(DRIVER_LICENSE_NUM) +
            ", " + conn.escape(DRIVER_LICENSE_CREATE) +
            ", " + conn.escape(LICENSE_NUM) +
            ", " + conn.escape(LICENSE_CREATE) +
            ") "

            const results = await db.exeTransaction(conn, queryString);
            return results;
        } catch (err) {
         throw err;
        }  
    },
    //  ?????????  ?????? ??????????????? ??????
    updateUserInfoByNoExe: async function (
        conn = null,
        NO = null,
        OFFICE_ID = null,
        ID = null,
        PW = null,
        ETC = null,
        DRIVER_ID = null,
        JOB_TYPE = null,
        JOB_POSITION = null,
        NAME = null,
        SSN = null,
        TEL = null,
        JOB_STATUS = null,
        CAR_NUM = null,
        JOIN_DTTI = null,
        LEAVE_DTTI = null,
        ADDRESS = null,
        DRIVER_LICENSE_NUM = null,
        DRIVER_LICENSE_CREATE = null,
        LICENSE_NUM = null,
        LICENSE_CREATE = null,
    ) {
        try {
            
            const queryUserByNo = `SELECT * FROM USER_INFO WHERE NO = ${conn.escape(NO)}`;
            const userByNoArr = await db.exeTransaction(conn, queryUserByNo);
            const userByNo = userByNoArr[0];
 
            let officeIdCheck = null;
            if(OFFICE_ID ==''){
                throw new Error("????????? ????????? ??? ?????? ????????? ??? ????????????."); 
            }
            else if(userByNo.OFFICE_ID == OFFICE_ID){
                  
            }else if(userByNo.OFFICE_ID != OFFICE_ID){

                const queryStringOfficeIdCheck = `SELECT * FROM OFFICE_INFO WHERE  OFFICE_ID = ${conn.escape(OFFICE_ID)}  `;
                const resultOfficeIdCheck = await db.exeTransaction(conn, queryStringOfficeIdCheck);
                if(resultOfficeIdCheck.length == 0){
                    throw new Error("?????? ??????????????? ???????????? ????????????.");
                }else{
                    officeIdCheck = OFFICE_ID;
                }
            }
            

            let driverIdCheck = null;
            if(DRIVER_ID ==''){
                throw new Error("????????? ????????? ??? ?????? ????????? ??? ????????????."); 
            }else if(userByNo.DRIVER_ID == DRIVER_ID){
                  
            }else if(userByNo.DRIVER_ID != DRIVER_ID){
                driverIdCheck = DRIVER_ID;
            }
        
 
            let encryptedPW = PW&&await encrypt_pw.encryptUserPW(PW);

            let queryString = "UPDATE USER_INFO SET NO = "+ conn.escape(NO) + " " ;
                if(officeIdCheck)   queryString+= ", OFFICE_ID = "+ conn.escape(officeIdCheck) + " " ;
                if(PW)              queryString+= ", PW = "+ conn.escape(encryptedPW) + " " ;
                if(ETC)             queryString+= ", ETC = "+ conn.escape(ETC) + " " ;
                if(driverIdCheck)   queryString+= ", DRIVER_ID = "+ conn.escape(driverIdCheck) + " " ;
                if(JOB_TYPE)        queryString+= ", JOB_TYPE = "+ conn.escape(JOB_TYPE) + " " ;
                if(JOB_POSITION)    queryString+= ", JOB_POSITION = "+ conn.escape(JOB_POSITION) + " " ;
                if(NAME)            queryString+= ", NAME = "+ conn.escape(NAME) + " " ;
                if(SSN)             queryString+= ", SSN = "+ conn.escape(SSN) + " " ;
                if(TEL)             queryString+= ", TEL = "+ conn.escape(TEL) + " " ;
                if(JOB_STATUS)      queryString+= ", JOB_STATUS = "+ conn.escape(JOB_STATUS) + " " ;
                if(CAR_NUM)         queryString+= ", CAR_NUM = "+ conn.escape(CAR_NUM) + " " ;
                if(JOIN_DTTI)       queryString+= ", JOIN_DTTI = "+ conn.escape(JOIN_DTTI) + " " ;
                if(LEAVE_DTTI)      queryString+= ", LEAVE_DTTI = "+ conn.escape(LEAVE_DTTI) + " " ;
                if(ADDRESS)         queryString+= ", ADDRESS = "+ conn.escape(ADDRESS) + " " ;
                if(DRIVER_LICENSE_NUM)      queryString+= ", DRIVER_LICENSE_NUM = "+ conn.escape(DRIVER_LICENSE_NUM) + " " ;
                if(DRIVER_LICENSE_CREATE)   queryString+= ", DRIVER_LICENSE_CREATE = "+ conn.escape(DRIVER_LICENSE_CREATE) + " " ;
                if(LICENSE_NUM)             queryString+= ", LICENSE_NUM = "+ conn.escape(LICENSE_NUM) + " " ;
                if(LICENSE_CREATE)          queryString+= ", LICENSE_CREATE = "+ conn.escape(LICENSE_CREATE) + " " ;
                queryString+= "WHERE NO = "+conn.escape(NO)+" ";

            const results = await db.exeTransaction(conn, queryString);
            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        } 
    },

    //  ????????? ?????? ??????
    deleteUserInfoByNoExe: async function (
        conn,
        NO,
    ) {
        try {
            const queryString =
                "DELETE FROM  USER_INFO " +
                "WHERE NO = "+conn.escape(NO)+"  ";
            const results = await db.exeTransaction(conn, queryString);
 
            return results;
        } catch (err) {
            log("deleteUserInfoByNoExe: " + err);
            throw err;
        } 
    },


    //////??? ?????? ??????
    insertCarInfoExe: async function (
        conn = null,
        OFFICE_ID = null,
        CAR_NUM = null,
        CAR_NAME = null,
        CAR_TYPE = null,
        DRIVE_TYPE = null,
        DRIVE_MODE = null,
        VEHICLE_TYPE = null,
        VEHICLE_YEAR = null,
        VEHICLE_REG = null,
        VEHICLE_EXPNG = null,
        VEHICLE_NUM = null,
        VEHICLE_INSPECTION_ST = null,
        VEHICLE_INSPECTION_ED = null,
        METER_INSPECTION_ST = null,
        METER_INSPECTION_ED = null,
        LIABILITY_INSURANCE_ST = null,
        LIABILITY_INSURANCE_ED = null,
        COMPRH_INSURANCE_ST = null,
        COMPRH_INSURANCE_ED = null,
    ) {
    try {


            if(CAR_NUM){
            const queryStringCarCheck = `SELECT * FROM CAR_INFO WHERE CAR_NUM = ${conn.escape(CAR_NUM)} `;
            const resultCarCheck = await db.exeTransaction(conn, queryStringCarCheck);
            if(resultCarCheck.length)throw new Error("The CAR_NUM already exists");
            }

            const queryString =
            "INSERT INTO CAR_INFO ( OFFICE_ID, CAR_NUM, CAR_NAME, CAR_TYPE, DRIVE_TYPE, DRIVE_MODE, VEHICLE_TYPE, VEHICLE_YEAR, VEHICLE_REG, "+
            "VEHICLE_EXPNG, VEHICLE_NUM, VEHICLE_INSPECTION_ST, VEHICLE_INSPECTION_ED, METER_INSPECTION_ST, METER_INSPECTION_ED, "+
            "LIABILITY_INSURANCE_ST, LIABILITY_INSURANCE_ED, COMPRH_INSURANCE_ST, COMPRH_INSURANCE_ED)" +
            "values ( " + conn.escape(OFFICE_ID) +
            ", " + conn.escape(CAR_NUM) +
            ", " + conn.escape(CAR_NAME) +
            ", " + conn.escape(CAR_TYPE) +
            ", " + conn.escape(DRIVE_TYPE) +
            ", " + conn.escape(DRIVE_MODE) +
            ", " + conn.escape(VEHICLE_TYPE) +
            ", " + conn.escape(VEHICLE_YEAR) +
            ", " + conn.escape(VEHICLE_REG) +
            ", " + conn.escape(VEHICLE_EXPNG) +
            ", " + conn.escape(VEHICLE_NUM) +
            ", " + conn.escape(VEHICLE_INSPECTION_ST) +
            ", " + conn.escape(VEHICLE_INSPECTION_ED) +
            ", " + conn.escape(METER_INSPECTION_ST) +
            ", " + conn.escape(METER_INSPECTION_ED) +
            ", " + conn.escape(LIABILITY_INSURANCE_ST) +
            ", " + conn.escape(LIABILITY_INSURANCE_ED) +
            ", " + conn.escape(COMPRH_INSURANCE_ST) +
            ", " + conn.escape(COMPRH_INSURANCE_ED) +
            ") ";

            const results = await db.exeTransaction(conn, queryString);
            return results;
        } catch (err) {
         throw err;
        }  
    },
    //  ??? ?????? ????????????
    updateCarInfoByNoExe: async function (
        conn = null,
        NO = null,
        CAR_NUM = null,
        CAR_NAME = null,
        CAR_TYPE = null,
        DRIVE_TYPE = null,
        DRIVE_MODE = null,
        VEHICLE_TYPE = null,
        VEHICLE_YEAR = null,
        VEHICLE_REG = null,
        VEHICLE_EXPNG = null,
        VEHICLE_NUM = null,
        VEHICLE_INSPECTION_ST = null,
        VEHICLE_INSPECTION_ED = null,
        METER_INSPECTION_ST = null,
        METER_INSPECTION_ED = null,
        LIABILITY_INSURANCE_ST = null,
        LIABILITY_INSURANCE_ED = null,
        COMPRH_INSURANCE_ST = null,
        COMPRH_INSURANCE_ED = null,
    ) {
        try {

            if(CAR_NUM){
                const queryStringCarCheck = `SELECT * FROM CAR_INFO WHERE CAR_NUM = ${conn.escape(CAR_NUM)} `;
                const resultCarCheck = await db.exeTransaction(conn, queryStringCarCheck);
                if(resultCarCheck.length)throw new Error("The CAR_NUM already exists");
            }

            let queryString = "UPDATE CAR_INFO SET NO = "+ conn.escape(NO) + " " ;
                if(CAR_NUM)      queryString+= ", CAR_NUM = "+ conn.escape(CAR_NUM) + " " ;
                if(CAR_NAME)      queryString+= ", CAR_NAME = "+ conn.escape(CAR_NAME) + " " ;
                if(CAR_TYPE)      queryString+= ", CAR_TYPE = "+ conn.escape(CAR_TYPE) + " " ;
                if(DRIVE_TYPE)      queryString+= ", DRIVE_TYPE = "+ conn.escape(DRIVE_TYPE) + " " ;
                if(DRIVE_MODE)      queryString+= ", DRIVE_MODE = "+ conn.escape(DRIVE_MODE) + " " ;
                if(VEHICLE_TYPE)      queryString+= ", VEHICLE_TYPE = "+ conn.escape(VEHICLE_TYPE) + " " ;
                if(VEHICLE_YEAR)      queryString+= ", VEHICLE_YEAR = "+ conn.escape(VEHICLE_YEAR) + " " ;
                if(VEHICLE_REG)      queryString+= ", VEHICLE_REG = "+ conn.escape(VEHICLE_REG) + " " ;
                if(VEHICLE_EXPNG)      queryString+= ", VEHICLE_EXPNG = "+ conn.escape(VEHICLE_EXPNG) + " " ;
                if(VEHICLE_NUM)      queryString+= ", VEHICLE_NUM = "+ conn.escape(VEHICLE_NUM) + " " ;
                if(VEHICLE_INSPECTION_ST)      queryString+= ", VEHICLE_INSPECTION_ST = "+ conn.escape(VEHICLE_INSPECTION_ST) + " " ;
                if(VEHICLE_INSPECTION_ED)      queryString+= ", VEHICLE_INSPECTION_ED = "+ conn.escape(VEHICLE_INSPECTION_ED) + " " ;
                if(METER_INSPECTION_ST)      queryString+= ", METER_INSPECTION_ST = "+ conn.escape(METER_INSPECTION_ST) + " " ;
                if(METER_INSPECTION_ED)      queryString+= ", METER_INSPECTION_ED = "+ conn.escape(METER_INSPECTION_ED) + " " ;
                if(LIABILITY_INSURANCE_ST)      queryString+= ", LIABILITY_INSURANCE_ST = "+ conn.escape(LIABILITY_INSURANCE_ST) + " " ;
                if(LIABILITY_INSURANCE_ED)      queryString+= ", LIABILITY_INSURANCE_ED = "+ conn.escape(LIABILITY_INSURANCE_ED) + " " ;
                if(COMPRH_INSURANCE_ST)      queryString+= ", COMPRH_INSURANCE_ST = "+ conn.escape(COMPRH_INSURANCE_ST) + " " ;
                if(COMPRH_INSURANCE_ED)      queryString+= ", COMPRH_INSURANCE_ED = "+ conn.escape(COMPRH_INSURANCE_ED) + " " ;
                queryString+= "WHERE NO = "+conn.escape(NO)+" ";

            const results = await db.exeTransaction(conn, queryString);
            // log("updateEventSettingByNoExe affectedRows:" + results.affectedRows);
            // log(results);
            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        } 
    },

    //  ??? ?????? ??????
    deleteCarInfoByNoExe: async function (
        conn = null,
        NO = null,
    ) {
        try {

            const queryString =
                "DELETE FROM  CAR_INFO " +
                "WHERE NO = "+conn.escape(NO)+"  ";

            const results = await db.exeTransaction(conn, queryString);
 
            return results;
        } catch (err) {
            //  console.error("error is " + err);
            throw new Error(err);
        } 
    },
 
    //  ?????? ??????????????? ?????? ???????????? ??????????????? ????????? 
    insertScheduleClosingTimeExe: async function (
        conn = null,
        OFFICE_ID = null,
        SET_TIME = null,
        SEQ_GROUP = null,
        REPORT_DATE = null,
        ST_DTTI = null,
        ED_DTTI = null,
        CAR_NUM = null,
    ) {
        try {
           
            let current;
            let yesterday;
            let reportDate;
           

             // ?????????????????? ?????????????????? ???????????? ????????? ??????
            if (ST_DTTI && ED_DTTI){
                current     = ED_DTTI;
                yesterday   = ST_DTTI; 
                // reportDate  = ST_DTTI.substring(0, 6);
                reportDate  = REPORT_DATE;
            }else{
                // current     = '211107020801'
                //                211122000000
                // // yesterday   = '211106050000';
                //                   211121000000
                // // reportDate  = '211106';
                //                   211121
                if(SET_TIME>12){ //???????????? ???????????? ?????? ??????
                    current     = moment().format(`YYMMDD${SET_TIME}0000`);
                    yesterday   = moment().subtract(1, 'days').format(`YYMMDD${SET_TIME}0000`);
                    reportDate  = moment().format(`YYMMDD`);
                }else{
                    current     = moment().format(`YYMMDD${SET_TIME}0000`);
                    yesterday   = moment().subtract(1, 'days').format(`YYMMDD${SET_TIME}0000`);
                    reportDate  = moment().subtract(1, 'days').format(`YYMMDD`);
                }
            }
            

            // if(SEQ_GROUP=='??????'){
            //     let queryGetSeqGroup = `DELETE FROM WORK_DAILY_SEQ WHERE REPORT_DATE = ${conn.escape(reportDate)} `+
            //                            ` AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} `;
            //     await db.exeTransaction(conn, queryGetSeqGroup);
            // }

            // ?????? ?????? ?????? setoffice??? ????????? ??????  
            let queryGetSetOff = `SELECT * FROM WORK_DAILY_SEQ WHERE REPORT_TYPE = 'setoff' `+
                        ` AND REPORT_DATE = ${conn.escape(reportDate)} AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} `;
            const getSetOff = await db.exeTransaction(conn, queryGetSetOff);

            if(getSetOff.length == 0){ //????????? setoff??? ????????? setoff ????????? 
                let queryInsertSetOff1 = `INSERT INTO WORK_DAILY_SEQ(REPORT_TYPE, OFFICE_ID, REPORT_DATE, BC_DTTI, DV_DTTI, P_DTTI, SEQ_GROUP)`+
                `VALUES('setoff', ${conn.escape(OFFICE_ID)}, ${conn.escape(reportDate)}, ${conn.escape(yesterday)}, ${conn.escape(yesterday)}, ${conn.escape(current)}, ${conn.escape(SEQ_GROUP)}) `;
                await db.exeTransaction(conn, queryInsertSetOff1);
                
            }
            else if(getSetOff.length == 1){ //????????? setoff??? ???????????? dri ??? ??????????????? setoff ???????????? ???. ????????????????????? ????????? ????????? null????????? 
                let queryDeleteOrign = `DELETE FROM WORK_DAILY_SEQ WHERE REPORT_TYPE= 'setdri' AND REPORT_DATE = ${conn.escape(reportDate)} AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} `;
                await db.exeTransaction(conn, queryDeleteOrign);
                
                let queryInsertSetOff2 = `UPDATE WORK_DAILY_SEQ SET REPORT_DATE =${conn.escape(reportDate)}, BC_DTTI =${conn.escape(yesterday)}, P_DTTI = ${conn.escape(current)} `+
                `WHERE REPORT_TYPE= 'setoff' AND NO = ${conn.escape(getSetOff[0].NO)}  `;
                await db.exeTransaction(conn, queryInsertSetOff2);
                
                if(SEQ_GROUP=='??????'){
                    let queryUpdateDate = `UPDATE WORK_DAILY_SEQ SET REPORT_DATE = NULL `+
                    `WHERE REPORT_DATE=  ${conn.escape(reportDate)} AND (REPORT_TYPE= 'drive' OR REPORT_TYPE= 'empty')  `;
                    await db.exeTransaction(conn, queryUpdateDate);
                }
            }   


            let queryCarDailyGroup; // ???????????? reportdate??? ???????????? ?????? ???????????? CAR_NUM ?????? ??????
            let carDailyGroup;
            if(SEQ_GROUP=='??????'){
                // work_daily_seq  ?????? ????????? CAR_NUM ?????? ??? REPORT DATE ????????? ?????????????????? ??????????????? NULL????????? ??????
                queryCarDailyGroup = `SELECT * FROM WORK_DAILY_SEQ WHERE `+
                `BC_DTTI >= ${conn.escape(yesterday)} AND BC_DTTI <= ${conn.escape(current)} AND `+
                `REPORT_DATE IS NULL AND OFFICE_ID = ${conn.escape(OFFICE_ID)} `;
                
                if(CAR_NUM){
                    queryCarDailyGroup += ` AND ( `;
                    
                    for(let i=0; i<CAR_NUM.length; i++){
                        queryCarDailyGroup += ` CAR_NUM = ${conn.escape(CAR_NUM[i])} or `;
                    }
                    queryCarDailyGroup += ` CAR_NUM = ${conn.escape(CAR_NUM[0])} ) `;
                }

                queryCarDailyGroup += ` GROUP BY CAR_NUM `; 
                carDailyGroup = await db.exeTransaction(conn, queryCarDailyGroup);
            }else{
                // ????????? ????????????
                queryCarDailyGroup = `SELECT * FROM WORK_DAILY_SEQ WHERE `+
                `BC_DTTI >= ${conn.escape(yesterday)} AND BC_DTTI <= ${conn.escape(current)} AND `+
                ` OFFICE_ID = ${conn.escape(OFFICE_ID)} AND (REPORT_TYPE= 'drive' OR REPORT_TYPE= 'empty')   `;
                
                if(CAR_NUM){
                    queryCarDailyGroup += ` AND ( `;
                    
                    for(let i=0; i<CAR_NUM.length; i++){
                        queryCarDailyGroup += ` CAR_NUM = ${conn.escape(CAR_NUM[i])} or `;
                    }
                    queryCarDailyGroup += ` CAR_NUM = ${conn.escape(CAR_NUM[0])} ) `;
                }

                queryCarDailyGroup += ` GROUP BY CAR_NUM `; 
                carDailyGroup = await db.exeTransaction(conn, queryCarDailyGroup);
            }
      

            // throw new Error('can delete ?????? only '); //????????? ???????????????????????????
            for(let i=0; i<carDailyGroup.length; i++){
                

                // let qwe =   `SELECT * FROM WORK_DAILY_SEQ WHERE BC_DTTI >= ${conn.escape(yesterday)} AND P_DTTI <= ${conn.escape(current)} AND DRIVER_ID = ${conn.escape(carDailyGroup[0])} `+
                //         ` AND OFFICE_ID = ${conn.escape(OFFICE_ID)} `;
                let queryGetDriverId = `SELECT * FROM WORK_DAILY_SEQ WHERE CAR_NUM = ${conn.escape(carDailyGroup[i].CAR_NUM)} GROUP BY DRIVER_ID ORDER BY NO ASC `;
                const getDriverId = await db.exeTransaction(conn, queryGetDriverId);

                for(let j=0; j<getDriverId.length; j++){ //????????? 2???????????? ??????????????? ???????????? for??????????????? 2???????????? ??????

                    let queryDailyMinMaxDTTI = `SELECT MAX(P_DTTI) AS MAX_DTTI, MIN(DV_DTTI) AS MIN_DTTI FROM WORK_DAILY_SEQ WHERE `+
                    ` DV_DTTI >= ${conn.escape(yesterday)} AND P_DTTI <= ${conn.escape(current)} AND DRIVER_ID = ${conn.escape(getDriverId[j].DRIVER_ID)} `+
                    `  AND CAR_NUM = ${conn.escape(getDriverId[j].CAR_NUM)} AND OFFICE_ID = ${conn.escape(OFFICE_ID)} and P_DTTI is not null and `+
                    ` TIMESTAMPDIFF(MINUTE, DATE_FORMAT(DV_DTTI, '%y%m%d%H%i%s'), DATE_FORMAT(P_DTTI, '%y%m%d%H%i%s') ) < 360 `;
                    const dailyMixMaxDTTI = await db.exeTransaction(conn, queryDailyMinMaxDTTI);

                    
                    const queryInsertSetDri = `INSERT INTO WORK_DAILY_SEQ(REPORT_TYPE, OFFICE_ID, REPORT_DATE, CAR_NUM, DRIVER_ID, BC_DTTI,DV_DTTI, P_DTTI, SEQ_GROUP) `+
                    ` VALUES('setdri', ${conn.escape(OFFICE_ID)}, ${conn.escape(reportDate)}, ${conn.escape(carDailyGroup[i].CAR_NUM)}, `+
                    ` ${conn.escape(getDriverId[j].DRIVER_ID)}, ${conn.escape(dailyMixMaxDTTI[0].MIN_DTTI)}, ${conn.escape(dailyMixMaxDTTI[0].MIN_DTTI)}, ${conn.escape(dailyMixMaxDTTI[0].MAX_DTTI)}, ${conn.escape(SEQ_GROUP)}) `;
                    const setDri = await db.exeTransaction(conn, queryInsertSetDri);
                
                    if(SEQ_GROUP=='??????'){
                        const queryUpdateReportDate = `UPDATE WORK_DAILY_SEQ SET REPORT_DATE = ${conn.escape(reportDate)} WHERE DRIVER_ID = ${conn.escape(getDriverId[j].DRIVER_ID)} `+
                        `AND BC_DTTI >= ${conn.escape(yesterday)} AND BC_DTTI <= ${conn.escape(current)} AND (REPORT_TYPE = 'drive' or REPORT_TYPE = 'empty') `;
                        await db.exeTransaction(conn, queryUpdateReportDate);
                    }
                }
            }
            // log("affectedRows:" + resDaily.affectedRows);

            return 1;
        } catch (err) {
            log("deleteEventSettingExe: " + err);
            throw err;
        }
    },

    updateScheduleClosingTimeExe: async function (
        conn = null,
        OFFICE_ID = null,
        SEQ_GROUP = null,
        REPORT_DATE = null,
        INPUT_DATA = null, 
    ) {
        try {
        
            let results;
            let reportDate  = REPORT_DATE;
            // let reportDate  = INPUT_DATA[0].ST_DTTI.substring(0, 6);

            for(let i = 0; i <INPUT_DATA.length; i++)
            {
                //??????REPORT_DATE null ???????????? drive empty ???
                if(SEQ_GROUP=='??????'){
                    const queryToNull =
                    "UPDATE WORK_DAILY_SEQ SET " +
                    "REPORT_DATE= null " +
                    "WHERE OFFICE_ID = " +conn.escape(OFFICE_ID)+"  AND  "+
                    "REPORT_DATE = "     +conn.escape(reportDate)+"  AND  "+
                    "DRIVER_ID = "       +conn.escape(INPUT_DATA[i].DRIVER_ID)+" AND "+
                    " ( REPORT_TYPE = 'drive' OR REPORT_TYPE = 'empty') ";
                    await db.exeTransaction(conn, queryToNull);
                }
                
                //setdri ?????? ????????? 
                const queryDriMinMax = 
                "select MIN(DV_DTTI) AS ST_DTTI , MAX(P_DTTI) AS ED_DTTI  from WORK_DAILY_SEQ "+ 
                "WHERE OFFICE_ID = "+conn.escape(OFFICE_ID)     +"  AND  "+
                "DRIVER_ID   = "    +conn.escape(INPUT_DATA[i].DRIVER_ID)+" AND "+
                "DV_DTTI >= "       +conn.escape(INPUT_DATA[i].ST_DTTI)+"   AND  "+
                "P_DTTI <= "       +conn.escape(INPUT_DATA[i].ED_DTTI)+"   AND  "+
                "( REPORT_TYPE = 'drive' OR REPORT_TYPE = 'empty')      ";
                const driMinMax = await db.exeTransaction(conn, queryDriMinMax);


                //setdri?????????
                const setdri = 
                "UPDATE WORK_DAILY_SEQ SET " +
                // "REPORT_DATE =  "+ conn.escape(reportDate)        + ", " +
                "BC_DTTI=   "+ conn.escape(driMinMax[0].ST_DTTI) + ", " +
                "DV_DTTI=   "+ conn.escape(driMinMax[0].ST_DTTI) + ", " +
                "P_DTTI =   "+ conn.escape(driMinMax[0].ED_DTTI) + "  " +
                "WHERE OFFICE_ID = "+conn.escape(OFFICE_ID)     +"  AND  "+
                "DRIVER_ID   = "    +conn.escape(INPUT_DATA[i].DRIVER_ID)+" AND "+
                "REPORT_DATE = "    +conn.escape(reportDate)+"  AND "+
                "SEQ_GROUP = "      +conn.escape(SEQ_GROUP) +"  AND "+
                "REPORT_TYPE = 'setdri'  " ;
                const setdri2 = await db.exeTransaction(conn, setdri);

                
                 //?????? seq REPORT_DATE ?????? 
                if(SEQ_GROUP=='??????'){
                    const queryString =
                    "UPDATE WORK_DAILY_SEQ SET " +
                    "REPORT_DATE = "    + conn.escape(reportDate)+ " " +
                    "WHERE OFFICE_ID =" +conn.escape(OFFICE_ID)+"  AND  "+
                    "BC_DTTI >= "       +conn.escape(INPUT_DATA[i].ST_DTTI)+"   AND  "+
                    "BC_DTTI <= "       +conn.escape(INPUT_DATA[i].ED_DTTI)+"   AND  "+
                    "DRIVER_ID = "      +conn.escape(INPUT_DATA[i].DRIVER_ID)+" AND  "+
                    " ( REPORT_TYPE = 'drive' OR REPORT_TYPE = 'empty') ";
                    await db.exeTransaction(conn, queryString);
                }

                log("updateScheduleClosingTimeExe affectedRows:" + INPUT_DATA.length);
            }
            return INPUT_DATA.length;
        } catch (err) {
            log("deleteEventSettingExe: " + err);
            throw err;
        } 
    },
  


    deleteScheduleClosingTimeExe: async function ( //?????? setdri setoff ?????? 
        conn = null,
        NO = null,
        REPORT_DATE = null,
        OFFICE_ID = null,
        SEQ_GROUP = null,
    ) {
        try {
            if(SEQ_GROUP =="??????") throw new Error('?????? ????????? ????????? ??? ????????????.'); //????????? ???????????????????????????
            let queryString = `DELETE FROM WORK_DAILY_SEQ WHERE REPORT_DATE = ${conn.escape(REPORT_DATE)} `+
            ` AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} AND ( REPORT_TYPE = 'setoff' OR REPORT_TYPE = 'setdri') `;
 
            if(NO.length !=0){
                queryString += ` AND ( `;
                
                for(let i=0; i<NO.length; i++){
                    queryString += ` NO = ${conn.escape(NO[i])} or `;
                }
                queryString += ` NO = ${conn.escape(NO[0])} ) `;
            }
            

            const results = await db.exeTransaction(conn, queryString);
            
            let querySeqZeroCheck = `SELECT * FROM WORK_DAILY_SEQ WHERE REPORT_TYPE= 'setdri' AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND ` + 
            ` REPORT_DATE = ${conn.escape(REPORT_DATE)} AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} `;
            const seqZeroCheck = await db.exeTransaction(conn, querySeqZeroCheck);
            
            if(seqZeroCheck.length == 0){
                let queryDeleteOrign = `DELETE FROM WORK_DAILY_SEQ WHERE REPORT_TYPE= 'setoff' AND OFFICE_ID = ${conn.escape(OFFICE_ID)} AND ` + 
                                       ` REPORT_DATE = ${conn.escape(REPORT_DATE)} AND SEQ_GROUP = ${conn.escape(SEQ_GROUP)} `;
                await db.exeTransaction(conn, queryDeleteOrign);
            }

            log("deleteScheduleClosingTimeExe ");

            return results;
        } catch (err) {
            log("deleteScheduleClosingTimeExe: " + err);
            throw err;
        }
    },
};