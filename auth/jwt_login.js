 
// const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const APP_SECRET = 'TEN-GraphQL-is-aw3some';

const db = require('../db/db_create');
// const sql = require('../db/db_exe');
// const search = require('../search/search');
// const seed_pw = require('../devicesPW/seed');
// const moment = require("moment");
// const rpa = require('../RPA/rpaProcess');

const encrypt_pw = require("./encrypt_pw");

const logger = require('../Logger/winston');
const log = (msg) => logger.info(msg);

 
module.exports = {

    // signUpExe: async function (Id, PW, UserName, GroupId) {
    //     let user;
    //     try {
    //         const results = await sql.insertUserExe(
    //             Id,
    //             IdInactive,
    //             IdForever,
    //             IdRestrictStart,
    //             IdRestrictEnd,
    //             PW,
    //             KeyPW,
    //             PWsType_No,
    //             UserName,
    //             GroupId,
    //             NetCode
    //         );
    //         if (!results) {
    //             throw new Error('Such user already exists');
    //         } else {
    //             const return_restuls = await sql.getUserByIdExe(Id);
    //             user = return_restuls.shift(); // user element extracting from results object.
    //         }
    //     } catch (err) {
    //         console.error("signUpExe error is " + err);
    //         throw new Error(err);
    //     }
    //     const token = jwt.sign({
    //         userId: user.id
    //     }, APP_SECRET);
    //     return {
    //         token,
    //         user
    //     }

    // },

  
    loginExe: async function (
        conn,
        ID,
        PW
    ) {
        // const CONTINUOUSFAILCOUNT_LIMIT = 5; 로그인 실패 횟수

   
        try {
            // 1. check if Id exists.
            let user;

            const queryString =
                "select * from USER_INFO where ID = " + conn.escape(ID);  //회사랑 아이디로 이 인물 존재하나 체크
 

            const results = await db.exeTransaction(conn, queryString);
            if (!results.length) {
                throw new Error('No such user Id found');
            }
            console.log("results: " + JSON.stringify(results));

            // const results = await sql.getUserByIdExe(Id);
            // if (!results.length) {
            //     throw new Error('No such user found');
            // }

            user = results.shift(); // user element extracting from results object.

 

            // if (user.ROLES == 'user') {
            //     throw new Error('Permission denied');
            // }
            // 2. check if PW is the same with one in the DB
            // const valid = await bcrypt.compare(PW, user.PW); 비번체크
            if (user.PW != await encrypt_pw.encryptUserPW(PW)) {
                throw new Error('Invalid password');
            }

            // 2. check if PW is the same with one in the DB
       

            // if (user.PW != PW) {
            //     throw new Error('Invalid password');
            // }


            // 3. check if IdInactive  퇴사한경우 체크 
            // if (user.LEAVE_DTTI) throw new Error('Id Inactive');

 
            //이재구과장: 계정보안에 관해선 로그인을 어차피 본인만 하는경우가 많기 때문에 보안은 덜신경써도 ㅇㅇ 
            // // 6. MustPWUpdate 확인. 반드시 ContinuousFailCount보다 먼저 확인할 것.
            // if (user.MustPWUpdate)
            //     throw new Error('MustPWUpdate. You must update PW');

            // // 7. ContinuousFailCount 확인
            // if (user.ContinuousFailCount >= CONTINUOUSFAILCOUNT_LIMIT)
            //     throw new Error('Continuous Fail Count is over ' + CONTINUOUSFAILCOUNT_LIMIT +
            //         '. Contact Administrator please');


            // 모든 검사 통과. 사용자권한 get
            // const resultsUsersToCodes = await sql.getUsersToCodesByIdExe([CorpId], [Id], conn);
            // console.log("resultsUsersToCodes:" + JSON.stringify(resultsUsersToCodes));

            // let NetGroupArray = [],
            //     UserGroupArray = [];
            // resultsUsersToCodes.map(function (v, i) {
            //     if (v.CodeId.indexOf("NET") > -1)
            //         NetGroupArray = [...NetGroupArray, v.CodeId];
            //     if (v.CodeId.indexOf("UGR") > -1)
            //         UserGroupArray = [...UserGroupArray, v.CodeId];
            // });

            // console.log("NetGroupArray:" + NetGroupArray + "UserGroupArray:" + UserGroupArray);

            // token 발행
            const token = jwt.sign({
                userId: ID,
                // userGroup: [user.GroupId],
                // userGroup: UserGroupArray,
                // NetGroup: NetGroupArray
            }, APP_SECRET, {
                expiresIn: '365d'
            });

            // 3
            // console.log("user in loginExe : "+ JSON.stringify(user));
            // let user = user.shift();
            // console.log("not array user in loginExe : "+ JSON.stringify(singleUser));


            // // rpaStatus update
            // if (Id.indexOf("RPA", 0) != -1) {
            //     await rpa.updateRpaStatus(Id, "Start");
            // }

            // await this.updateUserContinuousFailCount(conn, CorpId, Id, "OK");

            return {
                token,
                user
            }
        } catch (err) {
            // await this.updateUserContinuousFailCount(conn, CorpId, Id, "Error");

            // console.error("loginExe: " + err);
            logger.error("loginExe: " + err);

            throw err;
        } finally {
            // process.removeListener(myEvent1);
            // console.log("removeListener(myEvent1");
        }
    },

    // "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTU1MTc2NzczMX0.QuT9rDAyT7WC47RGG-Y4W5o3lLG8orMnCixR-ktV_R0"
    getAuth: async function (req) {
        try {
            const Authorization = req.header('Authorization');
            // let Authorization = '';
            // if (req.hasOwnProperty("headers"))
            //     if (req.headers.hasOwnProperty("authorization"))
            //         Authorization = req.headers.authorization;

            // console.log("Authorization in getAuth :" + Authorization);

            if (!Authorization) throw new Error('Please Sign in.');

            // const {
            //     userId
            // } = jwt.verify(token, APP_SECRET);
            const token = Authorization.replace('Bearer ', '');

            const decoded = jwt.verify(token, APP_SECRET);
            log("decoded in getAuth :" + JSON.stringify(decoded));

            return decoded;


        } catch (err) {
            console.log("getAuth: " + err);
            throw err;
        }
    },

};