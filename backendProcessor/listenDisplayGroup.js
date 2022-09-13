/**
 * @file: listenDisplayGroup.js
 * @Description: 监测维权后端处理函数
 * @author Bernard
 * @date 2021/5/23
*/
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../utils/localUtils.js';
import {countGroupBy, countNum, countNumJoinRight} from "./SelectUtil.js";

import util from 'util';

import mysql from 'mysql';
import {c} from "../MidBackend.js";
import {debugMode, CREATIONTYPE, TORTSITE} from '../utils/info.js';
// OVERIDE the Info
const WORKTYPE = {
    1:"音乐",2:"摄影",3:"短视频",4:"戏剧",5:"曲艺",
    6:"舞蹈",7:"杂技艺术",8:"美术",9:"建筑",10:"文字",
    11:"电影",12:"图形",13:"模型",14:"其他"
};
const CONNECT = true;// When false, Send Random Response
// export{
//     handleTortCount,// 发现的侵权总数量
//     handleTortClickCount,// 发现的侵权的总点击次数
//     handleTortCountEXchange,// 发现的侵权总数量随时间的变化
//     handleTortCountGroupByWorkType,// 截止当前不同作品类型或者不同作品类型下发生的侵权数量分布
//     handleTortCountGroupByCreationType,// 截止当前不同作品类型或者不同创作类型下发生的侵权数量分布
//     handleTortCountGroupByWorkTypeEXchange,// 不同作品类型的侵权数量随时间的变化
//     handleTortCountGroupByCreationTypeEXchange,// 不同创作类型的侵权数量随时间的变化
//     handleTortCountGroupByTortSite,// 截止当前，在前N个侵权站点，发现的侵权数量分布
//     handleTortCountGroupByTortSiteEXchange,// 截止当前，在前N个侵权站点，发现的侵权数量分布。
//     handleTortCountGroupByTortSiteGroupByWorkType,// 截止当前，前N个侵权站点发现的侵权数量在不同作品类型下的分布
//     handleTort_AND_ClaimCountGroupByWorkType,// 截止当前，在不同作品类型下的侵权维权分布
// }
/*
 * @param req: 请求
 * @param res: 返回
 * @author: Bernard
 * @date: 2021/6/2 17:08
 * @description:发现的侵权总数量。
 */
export async function handleTortCount(req, res) {
    console.time('handleTortCount');
    let sqlRes = await getTortCount();
    console.timeEnd('handleTortCount');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCount() {
    let tortCount = 0;
    if(CONNECT == true){
        let Res = await  countNum("tort_info","sample_id");
        tortCount = Res['num'];
    }
    else{
        tortCount = 0;
    }
    console.log("tortCount =",tortCount);
    return tortCount;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @author: Bernard
 * @date: 2021/6/2 17:08
 * @description:发现的侵权总数量的总点击次数。
 */
export async function handleTortClickCount(req, res) {
    console.time('handleTortClickCount');
    let sqlRes = await getTortClickCount();
    console.timeEnd('handleTortClickCount');
    console.log('--------------------');
    return sqlRes;
}
async function getTortClickCount() {
    let TortClickCount = 0;
    if(CONNECT == true){
        let sqlRight = "SELECT\n" +
        "\tSUM(Type.click_count) AS num\n" +
        "FROM\n" +
        "\t(\n" +
        "\t\tSELECT DISTINCT\n" +
        "\t\t\ttort_info.work_id, \n" +
        "\t\t\ttort_info.click_count\n" +
        "\t\tFROM\n" +
        "\t\t\ttort_info\n" +
        "\t) AS Type";
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        sqlRes.forEach(value =>
            TortClickCount = value['num']
        );
    }
    else{
        TortClickCount = 0;
    }
    console.log("TortClickCount =",TortClickCount);
    return TortClickCount;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @author: Bernard
 * @date: 2021/5/25 17:08
 * @description:发现的侵权总数量随时间的变化。
 */
export async function handleTortCountEXchange(req, res) {

    console.time('handleTortCountEXchange');
    let sqlRes = await getTortCountEXchange();
    console.timeEnd('handleTortCountEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let TortCountEXchange = [];
    let valueRes = 0;
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let sqlRight = util.format('SELECT DISTINCT\n' +
        '\tCOUNT(tort_info.work_id) AS num\n' +
        'FROM\n' +
        '\ttort_info\n' +
        '\t\tWHERE\n' +
        '\t\t\ttort_info.monitor_time <= %s AND\n' +
        '\t\t\ttort_info.monitor_time > %s\n',endTimeStamp,startTimeStamp)
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        sqlRes.forEach(value =>
            valueRes = value['num']
        );
        if(CONNECT == false)valueRes = localUtils.randomNumber(30,50);
        let MonthInfo = {
            "TortCount": valueRes,
            "Month" : MonthArray[index + 1],
        };
        TortCountEXchange.push(MonthInfo);
    }
    TortCountEXchange.reverse();
    console.log(TortCountEXchange);
    return TortCountEXchange;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: WorkType
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前不同作品类型或者不同作品类型下发生的侵权数量分布。
 */
export async function handleTortCountGroupByWorkType(req, res) {

    console.time('handleTortCountGroupByWorkType');
    let sqlRes = await getTortCountGroupByWorkType();
    console.timeEnd('handleTortCountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByWorkType() {
    let TortCountGroupByWorkType = [];
    let WorkTypeInfo = {};
    if(CONNECT == true){
        let sqlRight = util.format("SELECT\n" +
            "\tType.work_type, \n" +
            "\tCOUNT(Type.work_id) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\ttort_info.work_id, \n" +
            "\t\t\twork_info.work_type\n" +
            "\t\tFROM\n" +
            "\t\t\ttort_info\n" +
            "\t\t\tINNER JOIN\n" +
            "\t\t\twork_info\n" +
            "\t\t\tON \n" +
            "\t\t\t\ttort_info.work_id = work_info.work_id\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.work_type\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT 6");
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        sqlRes.forEach(function(item){
            let WorkTypeInfo = {
                "workType":WORKTYPE[item['work_type']],
                "TortCount":item['num'],
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        });

        // 空数据库保护
        if(TortCountGroupByWorkType.length < 6){
            PROTOTECT_getTortCountGroupByWorkType(TortCountGroupByWorkType);
        }
    }
    else{
        PROTOTECT_getTortCountGroupByWorkType(TortCountGroupByWorkType);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
    function PROTOTECT_getTortCountGroupByWorkType(TortCountGroupByWorkType){
        let selections = Object.values(WORKTYPE);
        TortCountGroupByWorkType.forEach(function (element) {
            deleteArraryElement(element.workType.toString(), selections)
        });
        let needNum = (6 - TortCountGroupByWorkType.length);
        for(let i = 1;i <= needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            deleteArraryElement(elementPick, selections);
            WorkTypeInfo = {
                "workType":elementPick,
                "TortCount":0
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        }
    }
}
/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前不同作品类型或者不同创作类型下发生的侵权数量分布。
 */
export async function handleTortCountGroupByCreationType(req, res) {

    console.time('handleTortCountGroupByCreationType');
    let sqlRes = await getTortCountGroupByCreationType();
    console.timeEnd('handleTortCountGroupByCreationType');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByCreationType() {
    let TortCountGroupByCreationType = [];


    if(CONNECT == true){
        let sqlRight = util.format("SELECT\n" +
            "\tType.creation_type, \n" +
            "\tCOUNT(Type.work_id) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\ttort_info.work_id, \n" +
            "\t\t\twork_info.creation_type\n" +
            "\t\tFROM\n" +
            "\t\t\ttort_info\n" +
            "\t\t\tINNER JOIN\n" +
            "\t\t\twork_info\n" +
            "\t\t\tON \n" +
            "\t\t\t\ttort_info.work_id = work_info.work_id\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.creation_type\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT 3");
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        sqlRes.forEach(function(item){
            let CreationTypeInfo = {
                "creationType":CREATIONTYPE[item['creation_type']],
                "TortCount":item['num'],
            };
            TortCountGroupByCreationType.push(CreationTypeInfo);
        });

        // 空数据库保护
        if(TortCountGroupByCreationType.length < 3){
            _PROTECT_(TortCountGroupByCreationType);
        }


    }
    else{
        _PROTECT_(TortCountGroupByCreationType);
    }
    console.log(TortCountGroupByCreationType);
    return TortCountGroupByCreationType;
    function _PROTECT_(TortCountGroupByCreationType){
        console.log("_PROTECT_");
        let selections = Object.values(CREATIONTYPE);
        TortCountGroupByCreationType.forEach(function (element) {
            deleteArraryElement(element.creationType.toString(), selections)
        });
        let needNum = (3 - TortCountGroupByCreationType.length);
        for(let i = 1;i <= needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            deleteArraryElement(elementPick, selections);
            let CreationTypeInfo = {
                "creationType":elementPick,
                "TortCount":0,
            };
            TortCountGroupByCreationType.push(CreationTypeInfo);
        }
    }
}
/*
 * @param req: 请求
 * @param res: 返回
 * @return: WorkType
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:3）	不同作品类型的侵权数量随时间的变化。
 */
export async function handleTortCountGroupByWorkTypeEXchange(req, res) {

    console.time('handleTortCountGroupByWorkTypeEXchange');
    let sqlRes = await getTortCountGroupByWorkTypeEXchange();
    console.timeEnd('handleTortCountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByWorkTypeEXchange(NUM_LIMIT = 3) {
    let TortCountGroupByWorkTypeEXchange = [];
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    let WorkTypeInfo = {};
    let TortCountGroupByWorkType = [];
    let endTimeStamp = TimeStampArray[0];
    let startTimeStamp = TimeStampArray[1];
    let keysSet = new Set();
    let sqlRight = "";
    if(CONNECT == true){
        // TODO 确定选中的类型
        let index = 0;
        console.log("size:",keysSet.size);
        while(keysSet.size < 3 && index < 12){
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            sqlRight = gen_sqlRight(endTimeStamp, startTimeStamp, NUM_LIMIT);
            let sqlRes = await mysqlUtils.sql(c, sqlRight);
            sqlRes.forEach(function(item){
                keysSet.add(item['work_type']);
            });
            index = index + MonthGap
        }
        console.log("keysSet:",keysSet);
        let keys = Array.from(keysSet);
        console.log("keys:",keys);

        for (let index = 0; index < 12; index = index + MonthGap) {
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            let TortCountGroupByWorkType = [];
            sqlRight = gen_sqlRight(endTimeStamp, startTimeStamp, NUM_LIMIT);
            let sqlRes = await mysqlUtils.sql(c, sqlRight);
            console.log("调试sqlRes",sqlRes);
            let Res = {};
            sqlRes.forEach(function(item){
                Res[item['work_type']]=item['num']
            });
            for (let i = 0, n = 3, key; i < n; ++i) {
                key = keys[i];
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "workType":WORKTYPE[key],
                    "TortCount":Res[key],
                    "Month" : MonthArray[index + MonthGap],
                };
                TortCountGroupByWorkType.push(MonthInfo);
            };
            TortCountGroupByWorkTypeEXchange.push(TortCountGroupByWorkType);
        }
        if(keys.length < 3){
            _PROTECT_getTortCountGroupByWorkTypeEXchange(TortCountGroupByWorkTypeEXchange,MonthGap,MonthArray);
        }
        console.log("TortCountGroupByWorkTypeEXchange:",TortCountGroupByWorkTypeEXchange);
    }
    else{
        _PROTECT_getTortCountGroupByWorkTypeEXchange(TortCountGroupByWorkTypeEXchange,MonthGap,MonthArray);
    }
    TortCountGroupByWorkTypeEXchange.reverse();
    console.log(TortCountGroupByWorkTypeEXchange);
    return TortCountGroupByWorkTypeEXchange;
    // TODO
    function _PROTECT_getTortCountGroupByWorkTypeEXchange(TortCountGroupByWorkTypeEXchange,MonthGap,MonthArray){
        console.log("_PROTECT_getTortCountGroupByWorkTypeEXchange");
        let selections = Object.values(WORKTYPE);
        let selectionWorkType = []
        let keyLenth = 0;
        console.log("TortCountGroupByWorkTypeEXchange",TortCountGroupByWorkTypeEXchange[0]);

        TortCountGroupByWorkTypeEXchange[0].forEach(function (element) {
            if (element.workType!=null){
                deleteArraryElement(element.workType.toString(), selections);
                selectionWorkType.push(element.workType.toString());
                keyLenth++;
            }
        });
        let needNum = 3 - keyLenth;
        console.log(needNum);
        for(let i = 0;i < needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            selectionWorkType.push(elementPick);
            deleteArraryElement(elementPick, selections);
        }
        console.log("selectionWorkType",selectionWorkType);
        for (let index = 0; index < 12; index = index + MonthGap) {
            for(let i = keyLenth;i < needNum + keyLenth;i++){
                console.log("needNum",i);
                TortCountGroupByWorkTypeEXchange[index][i].workType = selectionWorkType[i];
            }
        }
    }
    function gen_sqlRight(endTimeStamp,startTimeStamp, NUM_LIMIT) {
        return  util.format("SELECT\n" +
            "\tType.work_type, \n" +
            "\tCOUNT(Type.work_id) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\ttort_info.work_id, \n" +
            "\t\t\twork_info.work_type\n" +
            "\t\tFROM\n" +
            "\t\t\ttort_info\n" +
            "\t\t\tINNER JOIN\n" +
            "\t\t\twork_info\n" +
            "\t\t\tON \n" +
            "\t\t\t\ttort_info.work_id = work_info.work_id\n" +
            "\t\tWHERE\n" +
            "\t\t\ttort_info.upload_time <= %s AND\n" +
            "\t\t\ttort_info.upload_time > %s\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.work_type\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT %s",endTimeStamp,startTimeStamp,NUM_LIMIT);
    }
}
/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:不同创作类型的侵权数量随时间的变化。
 */
export async function handleTortCountGroupByCreationTypeEXchange(req, res) {

    console.time('handleTortCountGroupByCreationTypeEXchange');
    let sqlRes = await getTortCountGroupByCreationTypeEXchange();
    console.timeEnd('handleTortCountGroupByCreationTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByCreationTypeEXchange() {
    let TortCountGroupByCreationTypeEXchange = [];
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    let index = 0;
    let endTimeStamp = TimeStampArray[index];
    let startTimeStamp = TimeStampArray[(index + 1)];
    if(CONNECT == true){
        // TODO 确定选中的类型
        let keySet = new Set();
        while(keySet.size<3 && index<12){
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            let sqlRight = gen_SqlRight(endTimeStamp,startTimeStamp);
            let sqlRes = await mysqlUtils.sql(c, sqlRight);
            sqlRes.forEach(function(item){
                keySet.add(item['creation_type']);
            });
            index = index + MonthGap;
        }
        let keys = Array.from(keySet);
        for (let index = 0; index < 12; index = index + MonthGap) {
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            let TortCountGroupByCreationType = [];
            let sqlRight = gen_SqlRight(endTimeStamp,startTimeStamp);
            let sqlRes = await mysqlUtils.sql(c, sqlRight);
            let Res = {};
            sqlRes.forEach(function(item){
                Res[item['creation_type']]=item['num']
            });
            for (let i = 0, n = keys.length, key; i < n; ++i) {
                key = keys[i];
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "creationType":CREATIONTYPE[key],
                    "TortCount":Res[key],
                    "Month" : MonthArray[index + MonthGap],
                };
                TortCountGroupByCreationType.push(MonthInfo);
            };
            TortCountGroupByCreationTypeEXchange.push(TortCountGroupByCreationType);
        }
        if(keys.length < 3){
            _PROTECT_getTortCountGroupByCreationTypeEXchange(TortCountGroupByCreationTypeEXchange, MonthGap, MonthArray)
        }
    }
    else{
        _PROTECT_getTortCountGroupByCreationTypeEXchange(TortCountGroupByCreationTypeEXchange, MonthGap, MonthArray)
    }
    TortCountGroupByCreationTypeEXchange.reverse();
    console.log(TortCountGroupByCreationTypeEXchange);
    return TortCountGroupByCreationTypeEXchange;
    // TODO
    function _PROTECT_getTortCountGroupByCreationTypeEXchange(TortCountGroupByCreationTypeEXchange,MonthGap,MonthArray){
        console.log("_PROTECT_getTortCountGroupByCreationTypeEXchange");
        let selections = Object.values(CREATIONTYPE);
        let selectionCreationType = []
        let keyLenth = 0;
        console.log("TortCountGroupByCREATIONTYPEEXchange",TortCountGroupByCreationTypeEXchange[0]);
        console.log("TortCountGroupByCREATIONTYPEEXchange",TortCountGroupByCreationTypeEXchange);

        TortCountGroupByCreationTypeEXchange[0].forEach(function (element) {
            if (element.creationType!=null){
                deleteArraryElement(element.creationType.toString(), selections);
                selectionCreationType.push(element.creationType.toString());
                keyLenth++;
            }
        });
        let needNum = 3 - keyLenth;
        console.log(needNum);
        for(let i = 0;i < needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            selectionCreationType.push(elementPick);
            deleteArraryElement(elementPick, selections);
        }
        console.log("selectionCreationType",selectionCreationType);
        for (let index = 0; index < 12; index = index + MonthGap) {
            for(let i = keyLenth;i < needNum + keyLenth;i++){
                let MonthInfo = {
                    "creationType":selectionCreationType[i],
                    "TortCount":0,
                    "Month" : MonthArray[index + MonthGap],
                };
                TortCountGroupByCreationTypeEXchange[index].push(MonthInfo);
            }
        }
    }
    function gen_SqlRight(endTimeStamp,startTimeStamp){
        return  util.format("SELECT\n" +
            "\tType.creation_type, \n" +
            "\tCOUNT(Type.work_id) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\ttort_info.work_id, \n" +
            "\t\t\twork_info.creation_type\n" +
            "\t\tFROM\n" +
            "\t\t\ttort_info\n" +
            "\t\t\tINNER JOIN\n" +
            "\t\t\twork_info\n" +
            "\t\t\tON \n" +
            "\t\t\t\ttort_info.work_id = work_info.work_id\n" +
            "\t\tWHERE\n" +
            "\t\t\ttort_info.upload_time <= %s AND\n" +
            "\t\t\ttort_info.upload_time > %s\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.creation_type\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT 3",endTimeStamp,startTimeStamp);
    }
}



/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前，在前N个侵权站点，发现的侵权数量分布。
 */
export async function handleTortCountGroupByTortSite(req, res) {

    console.time('handleTortCountGroupByTortSite');
    let sqlRes = await getTortCountGroupByTortSite();
    console.timeEnd('handleTortCountGroupByTortSite');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByTortSite() {
    let TortCountGroupByTortSite = [];
    let TortSiteInfo = {};
    if(CONNECT == true){
        let Res = await countGroupBy("tort_info","site_name");
        let keys = Object.keys(Res);
        if(keys[0]==""){
            keys = [];
        }

        await Batch(TortCountGroupByTortSite);
        async function Batch(TortCountGroupByTortSite){
            let Res = await  countNum("tort_info","sample_id");
            let tortCount = Res['num'];
            TortSiteInfo = {
                "TortSite":TORTSITE[6],
                "TortCount":tortCount
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
        }


        for (let i = 0, n = keys.length, key; i < n; ++i) {
            key = keys[i];
            TortSiteInfo = {
                "TortSite":key,
                "TortCount":Res[key]
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
        }
        if(keys.length<3){
            _PROTECT_(TortCountGroupByTortSite);
        }
    }
    else{
        _PROTECT_(TortCountGroupByTortSite);
    }
    console.log(TortCountGroupByTortSite);
    return TortCountGroupByTortSite;
    function _PROTECT_(TortCountGroupByTortSite){
        console.log("_PROTECT_");
        let selections = Object.values(TORTSITE);
        TortCountGroupByTortSite.forEach(function (element) {
            deleteArraryElement(element.TortSite.toString(), selections)
        });
        let needNum = (3 - TortCountGroupByTortSite.length);
        for(let i = 1;i <= needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            deleteArraryElement(elementPick, selections);
            TortSiteInfo = {
                "TortSite":elementPick,
                "TortCount":0
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
        }
    }
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:截止当前，在前N个侵权站点，发现的侵权数量分布。
 */
export async function handleTortCountGroupByTortSiteEXchange(req, res) {

    console.time('handleTortCountGroupByTortSiteEXchange');
    let sqlRes = await getTortCountGroupByTortSiteEXchange();
    console.timeEnd('handleTortCountGroupByTortSiteEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByTortSiteEXchange() {
    let TortCountGroupByTortSiteEXchange = [];
    let TortCountGroupByTortSite = [];
    let TortSiteInfo = {};
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    if(CONNECT == true){
        let index = 0;
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let Res = await countGroupBy("tort_info","site_name", endTimeStamp , startTimeStamp, "monitor_time");
        let keys = Object.keys(Res);
        for (let i = 0, n = keys.length, key; i < n; ++i) {
            key = keys[i];
            let MonthInfo = {
                "TortSite":key,
                "TortCount":Res[key],
                "Month" : MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(MonthInfo);
        }
        TortCountGroupByTortSiteEXchange.push(TortCountGroupByTortSite);
        index = index + MonthGap;
        for (; index < 12; index = index + MonthGap) {
            let TortCountGroupByTortSite = [];
            let endTimeStamp = TimeStampArray[index];
            let startTimeStamp = TimeStampArray[(index + 1)];
            let Res = await countGroupBy("tort_info","site_name", endTimeStamp ,startTimeStamp,"monitor_time");
            for (let i = 0, n = keys.length, key; i < n; ++i) {
                key = keys[i];
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "TortSite":key,
                    "TortCount":Res[key],
                    "Month" : MonthArray[index + MonthGap],
                };
                TortCountGroupByTortSite.push(MonthInfo);
            }
            TortCountGroupByTortSiteEXchange.push(TortCountGroupByTortSite);
        }
    }
    else{
        for (let index = 0; index < 12; index = index + MonthGap) {
            let TortCountGroupByTortSite = [];
            TortSiteInfo = {
                "TortSite": TORTSITE["3"],
                "TortCount": 0,
                "Month": MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
            TortSiteInfo = {
                "TortSite": TORTSITE["2"],
                "TortCount": 0,
                "Month": MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
            TortSiteInfo = {
                "TortSite": TORTSITE["1"],
                "TortCount": 0,
                "Month": MonthArray[index + MonthGap],
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
            TortCountGroupByTortSiteEXchange.push(TortCountGroupByTortSite);
        }
    }
    console.log(TortCountGroupByTortSiteEXchange);
    return TortCountGroupByTortSiteEXchange;
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard1
 * @date: 2021/5/25 17:31
 * @description:截止当前，前N个侵权站点发现的侵权数量在不同作品类型下的分布。
 */
export async function handleTortCountGroupByTortSiteGroupByWorkType(req, res) {

    console.time('handleTortCountGroupByTortSiteGroupByWorkType');
    let sqlRes = await getTortGroupByTortSiteGroupByWorkType();
    console.timeEnd('handleTortCountGroupByTortSiteGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getTortGroupByTortSiteGroupByWorkType() {
    let TortCountGroupByWorkType = [];
    let WorkTypeInfo = {};
    let totalTortCount = 0;
    if(CONNECT == true) {
        let Res = await countGroupBy("tort_info", "site_name", null, null, null, 6);
        let keys = Object.keys(Res);
        let sqlRight = util.format("SELECT\n" +
            "\tCOUNT(Type.work_id) AS num, \n" +
            "\tType.work_type\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT\n" +
            "\t\t\twork_info.work_type, \n" +
            "\t\t\ttort_info.work_id\n" +
            "\t\tFROM\n" +
            "\t\t\ttort_info\n" +
            "\t\t\tINNER JOIN\n" +
            "\t\t\twork_info\n" +
            "\t\t\tON \n" +
            "\t\t\t\ttort_info.work_id = work_info.work_id\n" +
            "\t\tWHERE\n" +
            "\t\t\ttort_info.site_name = \"%s\"OR\n" +
            "\t\t\ttort_info.site_name = \"%s\"OR\n" +
            "\t\t\ttort_info.site_name = \"%s\"\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\twork_type\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT 6", keys[0], keys[1], keys[2]);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        sqlRes.forEach(function (item) {
            let WorkTypeInfo = {
                "workType": WORKTYPE[item['work_type']],
                "TortCount": item['num'],
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        });

        return getTortCountGroupByWorkType();
        // if (TortCountGroupByWorkType.length < 6) {
        //     _PROTECT_getTortGroupByTortSiteGroupByWorkType(TortCountGroupByWorkType);
        // }

    }
    else{
        _PROTECT_getTortGroupByTortSiteGroupByWorkType(TortCountGroupByWorkType);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
    function _PROTECT_getTortGroupByTortSiteGroupByWorkType(TortCountGroupByWorkType) {
        console.log("_PROTECT_getTortGroupByTortSiteGroupByWorkType");

        let selections = Object.values(WORKTYPE);
        TortCountGroupByWorkType.forEach(function (element) {
            deleteArraryElement(element.workType.toString(), selections);
        });
        let needNum = (6-TortCountGroupByWorkType.length);
        for(let i = 1;i <= needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            deleteArraryElement(elementPick, selections);
            let WorkTypeInfo = {
                "workType":elementPick,
                "TortCount":0,
                "TotalTortCount":0,
                "ClaimCount":0
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        }

        for(let i = 1;i <= 6;i++){
            let WorkTypeInfo = {
                "workType":WORKTYPE[i],
                "TortCount":0,
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        }
    }
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard1
 * @date: 2021/5/25 17:31
 * @description:截止当前，在不同作品类型下的侵权维权分布。
 */
export async function handleTort_AND_ClaimCountGroupByWorkType(req, res) {

    console.time('handleTort_AND_ClaimCountGroupByWorkType');
    let sqlRes = await getTortTort_AND_ClaimCountGroupByWorkType();
    console.timeEnd('handleTort_AND_ClaimCountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getTortTort_AND_ClaimCountGroupByWorkType() {
    let TortCountGroupByWorkType = [];
    let WorkTypeInfo = {};
    let totalTortCount = 0;
    if(CONNECT == true){
        let Res = await  countNum("tort_info","sample_id");
        totalTortCount = Res['num'];
        let sqlRight = util.format("SELECT\n" +
            "\tType.work_type, \n" +
            "\tCOUNT(Type.work_id) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\ttort_info.work_id, \n" +
            "\t\t\twork_info.work_type\n" +
            "\t\tFROM\n" +
            "\t\t\ttort_info\n" +
            "\t\t\tINNER JOIN\n" +
            "\t\t\twork_info\n" +
            "\t\t\tON \n" +
            "\t\t\t\ttort_info.work_id = work_info.work_id\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.work_type\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT 6");
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        sqlRes.forEach(function(item){
            let WorkTypeInfo = {
                "workType":WORKTYPE[item['work_type']],
                "TortCount":item['num'],
                "TotalTortCount": totalTortCount,
                "ClaimCount": 0
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        });
        if(TortCountGroupByWorkType.length<6){
            _PROTECT_(TortCountGroupByWorkType);
        }
    }
    else{
        _PROTECT_(TortCountGroupByWorkType);
    }
    console.log(TortCountGroupByWorkType);
    return TortCountGroupByWorkType;
    function _PROTECT_(TortCountGroupByWorkType){
        let selections = Object.values(WORKTYPE);
        TortCountGroupByWorkType.forEach(function (element) {
            deleteArraryElement(element.workType.toString(), selections)
        });
        let needNum = (6 - TortCountGroupByWorkType.length);
        for(let i = 1;i <= needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            deleteArraryElement(elementPick, selections);
            let WorkTypeInfo = {
                "workType":elementPick,
                "TortCount":0,
                "TotalTortCount":0,
                "ClaimCount":0
            };
            TortCountGroupByWorkType.push(WorkTypeInfo);
        }
    }
}
// 删除指定ArraryElement
function deleteArraryElement(element, Arrary){
    let deleteIndex = Arrary.indexOf(element);
    Arrary.splice(deleteIndex,1);
}

/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description: 某类型作品侵权最严重的前3个站点
 */
export async function handleTortSiteIntensityGroupByWorkType(req, res) {

    console.time('handleTortSiteIntensityGroupByWorkType');
    const workType = req.WorkType;
    const SiteNum = req.SiteNum;
    let sqlRes = await getTortSiteIntensityGroupByWorkType(workType, SiteNum);
    console.timeEnd('handleTortSiteIntensityGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getTortSiteIntensityGroupByWorkType(workType, SiteNum) {
    let SiteIntensityGroupByWorkType = [];
    let TortSiteInfo = {};
    if(CONNECT == true){
        // 按照某作品排序侵权最多的三个站点情况
        let sqlRight = util.format(
            'SELECT\n' +
            '\t*\n' +
            'FROM\n' +
            '\t(\n' +
            '\t\tSELECT\n' +
            '\t\t\t%s.%s, \n' +
            '\t\t\tCOUNT(%s.%s) AS num\n' +
            '\t\tFROM\n' +
            '\t\t\t%s\n',
            "tort_info", "site_name",
            "tort_info", "work_type",
            table);
            let sqlRes = await mysqlUtils.sql(c, sqlRight);
            // let Res = {};
            sqlRes.forEach(value =>
            Res[[value[byKey]]] = value['num']
            );
        // let Res = await countGroupBy2("tort_info","site_name");
        let keys = Object.keys(Res);
        if(keys[0]==""){
            keys = [];
        }

        await Batch(TortCountGroupByTortSite);
        async function Batch(TortCountGroupByTortSite){
            let Res = await  countNum("tort_info","sample_id");
            let tortCount = Res['num'];
            TortSiteInfo = {
                "TortSite":TORTSITE[6],//"网易云音乐"
                "TortCount":tortCount
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
        }


        for (let i = 0, n = keys.length, key; i < n; ++i) {
            key = keys[i];
            TortSiteInfo = {
                "TortSite":key,
                "TortCount":Res[key]
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
        }
        if(keys.length<3){
            _PROTECT_(TortCountGroupByTortSite);
        }
    }
    else{
        _PROTECT_(TortCountGroupByTortSite);
    }
    console.log(TortCountGroupByTortSite);
    return TortCountGroupByTortSite;
    function _PROTECT_(TortCountGroupByTortSite){
        console.log("_PROTECT_");
        let selections = Object.values(TORTSITE);
        TortCountGroupByTortSite.forEach(function (element) {
            deleteArraryElement(element.TortSite.toString(), selections)
        });
        let needNum = (3 - TortCountGroupByTortSite.length);
        for(let i = 1;i <= needNum;i++){
            let elementPick = selections.splice(0,1)[0];
            deleteArraryElement(elementPick, selections);
            TortSiteInfo = {
                "TortSite":elementPick,
                "TortCount":0
            };
            TortCountGroupByTortSite.push(TortSiteInfo);
        }
    }
}


