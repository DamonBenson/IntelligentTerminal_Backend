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
import {countGroupBy, countNum} from "./SelectUtil.js";

import util from 'util';
import mysql from 'mysql';

import {c2} from "../MidBackend.js";
import {debugMode, WORKTYPE, TORTSITE, PICTURE_WORKTYPE, MOVIE_WORKTYPE, MUSIC_WORKTYPE} from '../utils/info.js';
const CONNECT = true;// When false, Send Random Response

/*
 * @param req: 请求
 * @param res: 返回
 * @author: Bernard
 * @date: 2021/6/2 17:08
 * @description:发现的侵权线索总数量。
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
        let Res = await  countNum(c2,"Evidence","id");
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
 * @description:发现的侵权作品总数。
 */
export async function handleTortWorkCount(req, res) {
    console.time('handleTortWorkCount');
    let sqlRes = await getTortWorkCount();
    console.timeEnd('handleTortWorkCount');
    console.log('--------------------');
    return sqlRes;
}
async function getTortWorkCount() {
    let TortClickCount = 0;
    if(CONNECT == true){
        let sqlRight = "SELECT\n" +
        "\tCOUNT(Type.workid) AS num\n" +
        "FROM\n" +
        "\t(\n" +
        "\t\tSELECT DISTINCT\n" +
        "\t\t\tEvidence.workid\n" +
        "\t\tFROM\n" +
        "\t\t\tEvidence\n" +
        "\t) AS Type";
        let sqlRes = await mysqlUtils.sql(c2, sqlRight);
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
 * @return: null
 * @author: Bernard
 * @date: 2021/5/25 17:31
 * @description:不同创作类型的侵权数量随时间的变化。
 */
export async function handleTortCountGroupByWorkTypeEXchange(req, res, SelectOption) {

    console.time('handleTortCountGroupByWorkTypeEXchange');
    let sqlRes = await getTortCountGroupByWorkTypeEXchange(SelectOption);
    console.timeEnd('handleTortCountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTortCountGroupByWorkTypeEXchange(SelectOption) {
    let TortCountGroupByWorkTypeEXchange = [];
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let MonthGap = 1;
    let index = 0;
    let endTimeStamp = TimeStampArray[index];
    let startTimeStamp = TimeStampArray[(index + 1)];
    if(CONNECT == true){
        // 选择3个站点
        let tortSites = [];
        let sqlRight = gen_SqlRight(TimeStampArray[0], TimeStampArray[11], SelectOption);
        let sqlRes = await mysqlUtils.sql(c2, sqlRight);
        sqlRes.forEach(function(item){
            tortSites.push(item["tortsite"]);
        });

        let indexCount = 1;//下方循环的计数器
        while(tortSites.length <3){
            tortSites.push(TORTSITE[indexCount++]);
        }
        // 根据前三个站点做出统计
        for (let index = 0; index < 12; index = index + MonthGap) {
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            let TortCountGroupByWorkType = [];
            let sqlRight = gen_SqlRight(endTimeStamp, startTimeStamp, SelectOption, tortSites);
            let sqlRes = await mysqlUtils.sql(c2, sqlRight);
            let res ={};
            sqlRes.forEach(function(item){
                res[item['tortsite']]=item['num'];
            });
            tortSites.forEach(function(tortsite){
                let MonthInfo = {
                    "TortSite":tortsite,
                    "TortCount":res[tortsite]!=undefined?res[tortsite]:0,
                    "Month" : MonthArray[index + MonthGap],
                };
                TortCountGroupByWorkType.push(MonthInfo);
            });

            TortCountGroupByWorkTypeEXchange.push(TortCountGroupByWorkType);
        }
        // if(keys.length < 3){
        //     _PROTECT_getTortCountGroupByWorkTypeEXchange(TortCountGroupByWorkTypeEXchange, MonthGap, MonthArray)
        // }
    }
    else{
        _PROTECT_getTortCountGroupByWorkTypeEXchange(TortCountGroupByWorkTypeEXchange, MonthGap, MonthArray)
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
        console.log("TortCountGroupByWorkTypeEXchange",TortCountGroupByWorkTypeEXchange);

        TortCountGroupByWorkTypeEXchange[0].forEach(function (element) {
            if (element.WORKTYPE!=null){
                deleteArraryElement(element.WORKTYPE.toString(), selections);
                selectionWorkType.push(element.WORKTYPE.toString());
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
                let MonthInfo = {
                    "TortSite":selectionWorkType[i],
                    "TortCount":0,
                    "Month" : MonthArray[index + MonthGap],
                };
                TortCountGroupByWorkTypeEXchange[index].push(MonthInfo);
            }
        }
    }
    // @param SelectOption:选择音乐、视频或者图片组。
    function gen_SqlRight(endTimeStamp, startTimeStamp, SelectOption, tortSite = null, table = "Evidence", byKey= "tortsite"){
        let sqlRight = util.format("SELECT\n" +
            "\tType.tortsite, \n" +
            "\tCOUNT(Type.workid) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\tEvidence.workid, \n" +
            "\t\t\tEvidence.tortsite \n" +
            "\t\tFROM\n" +
            "\t\t\tEvidence\n" +
            "\t\tWHERE\n" +
            "\t\t\t(Evidence.timestamp <= %s AND\n" +
            "\t\t\tEvidence.timestamp > %s )AND(\n",endTimeStamp,startTimeStamp);
        SelectOption.forEach(value =>
            sqlRight = sqlRight + util.format(
                '\t\t\t%s.workType = %s OR\n',
                table,value)
        );
        sqlRight = sqlRight + util.format('\t\t\tFALSE)\n');
        if(tortSite != null){
            sqlRight = sqlRight + util.format(
                '\t\t\tAND(\n');
            tortSite.forEach(value =>
                sqlRight = sqlRight + util.format(
                    '\t\t\t%s.tortsite = "%s" OR\n',
                    table,value)
            );
            sqlRight = sqlRight + util.format('\t\t\tFALSE)\n');
        }
        sqlRight = sqlRight + util.format(
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.tortsite\n" +
            "ORDER BY\n" +
            "\ttortsite DESC\n" +
            "LIMIT 3");
        return sqlRight;
    }
}



/*
 * @param req: 请求
 * @param res: 返回
 * @return: null
 * @author: Bernard
 * @date: 2022年9月28日
 * @description:截止当前，在前N个侵权站点，发现的侵权数量分布。
 */

export async function handleTortCountGroupByTortSite(req, res, SelectOption) {

    console.time('handleTortCountGroupByTortSite');
    let sqlRes = await getTortCountGroupByTortSite(SelectOption);
    console.timeEnd('handleTortCountGroupByTortSite');
    console.log('--------------------');
    return sqlRes;
}
// @param SelectOption:选择音乐、视频或者图片组。
async function getTortCountGroupByTortSite(SelectOption) {
    let TortCountGroupByTortSite = [];
    let TortSiteInfo = {};
    if(CONNECT == true){

        // @param SelectOption:选择音乐、视频或者图片组。
        function gen_SqlRight(SelectOption, limit = 3, table = "Evidence", byKey= "tortsite") {
            let sqlRight = util.format(
                'SELECT\n' +
                '\t*\n' +
                'FROM\n' +
                '\t(\n' +
                '\t\tSELECT\n' +
                '\t\t\t%s.%s, \n' +
                '\t\t\tCOUNT(%s.%s) AS num\n' +
                '\t\tFROM\n' +
                '\t\t\t%s\n' +
                '\t\tWHERE\n',
                table, byKey,
                table, byKey,
                table);
            SelectOption.forEach(value =>
                sqlRight = sqlRight+util.format(
                '\t\t\t%s.workType = %s OR\n',
                table,value)
            );
            sqlRight = sqlRight+util.format('\t\t\tFALSE\n');


            sqlRight = sqlRight + util.format(
                '\t\tGROUP BY\n' +
                '\t\t\t%s.%s\n' +
                '\t) AS Type\n' +
                'ORDER BY\n' +
                '\tnum DESC\n' +
                'LIMIT %d',
                table, byKey,
                limit);
            return sqlRight;
        }
        let sqlRight = gen_SqlRight(SelectOption);
        let sqlRes = await mysqlUtils.sql(c2, sqlRight);
        let Res = {};
        sqlRes.forEach(value =>
            Res[[value["tortsite"]]] = value['num']
        );
        let keys = Object.keys(Res);
        if(keys[0]==""){
            keys = [];
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
        let Res = await  countNum(c2,"Evidence","id");
        totalTortCount = Res['num'];
        let sqlRight = util.format("SELECT\n" +
            "\tType.workType, \n" +
            "\tCOUNT(Type.workid) AS num\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT DISTINCT\n" +
            "\t\t\tEvidence.workid, \n" +
            "\t\t\tEvidence.workType\n" +
            "\t\tFROM\n" +
            "\t\t\tEvidence\n" +
            "\t) AS Type\n" +
            "GROUP BY\n" +
            "\tType.workType\n" +
            "ORDER BY\n" +
            "\tnum DESC\n" +
            "LIMIT 6");
        let sqlRes = await mysqlUtils.sql(c2, sqlRight);
        sqlRes.forEach(function(item){
            let WorkTypeInfo = {
                "workType":WORKTYPE[item['workType']],
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




