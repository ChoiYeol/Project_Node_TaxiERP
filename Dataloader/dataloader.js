// 1. Call 순서
// resolver <-> dataloader <-> exeFunction
// 2. 제약조건
// - dataloader function의 input은 array[keys]. ex) ["BBB001","BBB002","BBB003"]
// - dataloader function의 output은 array[values]. ex) [{No:1,Id:"BBB001"},{No:2,Id:"BBB002"},{No:3,Id:"BBB003"}]
// - input과 output의 갯수가 같아야 함.

const dataloader = require("dataloader");
const sql = require("../db/db_exe");



function arrayFromObject(obj) {
    var arr = [];
    for (var i in obj) {
        arr.push(obj[i]);
    }
    return arr;
}

// 1. dataloader의 입력 array와 출력 array length를 맞추기 위해 출력 array를 keys기준으로 grouping.
// 2. 출력 array length가 적다면 null 삽입
// 3. 출력 array를 입력 array의 순서에 맞춰 reordering.
function arrangeResultsForDataLoader (inputData, results, fn){
    var groups = {};
    for (var i = 0; i < results.length; i++) {
        var group = JSON.stringify(fn(results[i])); 
        if (group in groups) {
            groups[group].push(results[i]);
        } else {
            groups[group] = [results[i]];
        }
    }
    const resultsGroups = arrayFromObject(groups);
    let outArray = [];
    for (let i = 0; i < inputData.length; i++) {
        let filterdObj = resultsGroups.find(function (item, index) {

            let keysItem = fn(item[0]);
            if (JSON.stringify(keysItem[0]) === JSON.stringify(inputData[i].DRIVER_ID)) {

                outArray.push(item);
                return true;
            }
        })
        if (filterdObj === undefined) outArray.push([]);
    }
    return outArray;
}


module.exports = {
    searchPagingExeLoader: new dataloader(async (
        // "Table"
        // "Search"
        // "Start"
        // "End":
        // "Order": 
        // "First": 
        // "Offset": 
        inputKey
    ) => {
        // console.log("searchPagingExeLoader Table:" + Table + " Search:" + Search + " Order:" + Order + " First:" + First);
        // console.log("searchPagingExeLoader inputKey: " + JSON.stringify(inputKey));

        const results = await sql.searchPagingExe(
            inputKey[0].Table,
            inputKey[0].Search,
            inputKey[0].Except,
            inputKey[0].Start,
            inputKey[0].End,
            inputKey[0].ByCol,
            inputKey[0].Order,
            inputKey[0].First,
            inputKey[0].Offset,
            // inputKey[0].ExactMatch,
            // inputKey[0].GroupBy
            );
        // console.log("searchPagingExeLoader results:" + JSON.stringify(results));
        // results.resultsList.push({"totalCount":results.totalCount});
        return [results];
    }, {
        cache: true
    }),

 
    getUsersByDriverIdExeLoader: new dataloader(async (inputKey) => {
        
        let DRIVER_ID = [];
        let OFFICE_ID =  inputKey[0].OFFICE_ID;
        inputKey.map((v, i) => {    
            DRIVER_ID = [...DRIVER_ID, v.DRIVER_ID];
        });

        const results = await sql.getUsersByDriverIdExe(DRIVER_ID, OFFICE_ID);
        // console.log("getDeviceByIdExeLoader results" + JSON.stringify(results));

        // reordering for DataLoader
        let resultsArrange = arrangeResultsForDataLoader(inputKey, results, function (item) {
            // return [item.Id];
            return [item.DRIVER_ID];

        });

        // return results;
        return resultsArrange
    }, {
        cache: true
    }),
    // getUsersByDriverIdExeLoader: new dataloader(async (DRIVER_ID) => {
    //     // let t1 = moment();
    //     const results = await sql.getUsersByDriverIdExe(DRIVER_ID);
        
    //     const usersMap = {};
    //     results.forEach((user) => (usersMap[user.DRIVER_ID] = user));
    //     let a =  DRIVER_ID.map((id) => usersMap[id] || null);
    //     // let t2 = moment();
    //     // console.log('밀리세컨즈 차이: ', moment.duration(t2.diff(t1)).asMilliseconds());
    //     return a;
    // }, {
    //     cache: false
    // }),
    
};