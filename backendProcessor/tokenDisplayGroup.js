/**
 * @file: authDisplayGroup.js
 * @Description: 存证确权后端处理函数
 * @author Bernard
 * @date 2021/5/23
*/
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../utils/localUtils.js';

import util from 'util';

import mysql from 'mysql';
import {c1} from "../MidBackend.js";
import {debugMode, WORKTYPE, COPYRIGHTTYPE, COPYRIGHTCREATETYPE} from '../utils/info.js';
import {countGroupBy,  countNum} from "./SelectUtil.js";

const CONNECT = true;// When false, Send Random Response
// 不同作品类型通证的时间分布/季
export async function handleTokenAmountGroupByWorkTypeEXchange(extraData) {

    console.time('handleTokenAmountGroupByWorkTypeEXchange');
    let sqlRes = await getTokenAmountGroupByWorkTypeEXchange(extraData);


    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleTokenAmountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTokenAmountGroupByWorkTypeEXchange(extraData) {
    let [TimeStampArray,MonthArray] = DateUtil.getSeasonTimeStampArray();
    MonthArray.pop();
    MonthArray.reverse();
    let TokenAmountGroupByWorkTypeEXchange = [];
    let TokenAmountGroupByWorkType = [];
    let WorkTypeInfo = {};
    // console.log([TimeStampArray, MonthArray]);
    if(CONNECT == true){
        let index = 0;
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        console.log(TimeStampArray);
        //* 寻找最大的WORKTYPE *//
        // 北邮的数据库是按全部，而北版是按一年算，虽然结题时是不到一年的数据
        let totalres = await countGroupBy(c1, "Token", "baseInfo_workType");

        let RawRes = {};
        let keys = Object.keys(WORKTYPE);
        keys.forEach(value =>{
            totalres[value] = Number(totalres[value])?Number(totalres[value]):0;// undefined的0保护
            RawRes[value] = totalres[value];
        });
        let extraDataKeys = Object.keys(extraData)
        extraDataKeys.forEach(Month =>
            keys.forEach(value =>
                RawRes[value] = RawRes[value] + (Number(extraData[Month]["works"]["workType"][value])?Number(extraData[Month]["works"]["workType"][value]):0)
            )
        );
        console.log("totalres:",totalres);
        console.log("RawRes:",RawRes);
        // keys不足补齐
        let resTemp = RawRes;// 赋值为字典，但是使用时为有序数组
        // if(Object.keys(resTemp).length<19){
        //     const WORKTYPEKEYS = Object.keys(WORKTYPE);
        //     WORKTYPEKEYS.forEach(key=>{
        //         if(!resTemp[key]){
        //             resTemp[key] = 0;
        //         }
        //     })
        //     console.log("keys不足补齐resTemp:",resTemp);
        // }
        // 字典取三个最大值
        resTemp = Object.keys(resTemp).sort(function(a,b){ return resTemp[b] - resTemp[a];});
        let resMax = resTemp.slice(0,3);
        console.log("resMax:",resMax);
        console.log("resTemp:",resTemp);
        resTemp.splice(0,3);
        keys = resMax;//命名冲突,但不想改
        for (let index = 0; index < 4; index = index + 1) {
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            let sqlRight = gen_SqlRight(endTimeStamp , startTimeStamp, keys);
            let sqlRes = await mysqlUtils.sql(c1, sqlRight);
            let Res = {};
            sqlRes.forEach(value =>
                Res[[value["baseInfo_workType"]]] = value['num']
            );
            TokenAmountGroupByWorkType =[];
            for (let i = 0, n = keys.length, key; i < n; ++i) {
                key = keys[i];
                //空返回补0
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "workType":WORKTYPE[key],
                    "TokenAmount":Res[key]
                        + (Number(extraData[index*3+1]["works"]["workType"][key])?Number(extraData[index*3+1]["works"]["workType"][key]):0)
                        + (Number(extraData[index*3+2]["works"]["workType"][key])?Number(extraData[index*3+2]["works"]["workType"][key]):0)
                        + (Number(extraData[index*3+3]["works"]["workType"][key])?Number(extraData[index*3+3]["works"]["workType"][key]):0),
                    "Month" : MonthArray[index],
                };
                TokenAmountGroupByWorkType.push(MonthInfo);
            }
            // 剩余类型并入“剩余的"类，不用其他是为了辨别
            let spareSum = 0;
            resTemp.forEach(key=>{
                spareSum += Res[key]?Res[key]:0 +
                    + (Number(extraData[index*3+1]["works"]["workType"][key])?Number(extraData[index*3+1]["works"]["workType"][key]):0)
                    + (Number(extraData[index*3+2]["works"]["workType"][key])?Number(extraData[index*3+2]["works"]["workType"][key]):0)
                    + (Number(extraData[index*3+3]["works"]["workType"][key])?Number(extraData[index*3+3]["works"]["workType"][key]):0);

            })
            let MonthInfo = {
                "workType":"剩余的",
                "TokenAmount":spareSum,
                "Month" : MonthArray[index],
            };
            TokenAmountGroupByWorkType.push(MonthInfo);
            TokenAmountGroupByWorkTypeEXchange.push(TokenAmountGroupByWorkType);

        }
        console.log(TokenAmountGroupByWorkTypeEXchange);
    }
    else{
        for (let index = 0; index < 3; index = index + SeasonGap) {
            let TokenAmountGroupByWorkType = [];

            WorkTypeInfo = {
                "workType":"音乐",
                "TokenAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            TokenAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"电影",
                "TokenAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            TokenAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"美术",
                "TokenAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            TokenAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"剩余的",
                "TokenAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            TokenAmountGroupByWorkType.push(WorkTypeInfo);
            TokenAmountGroupByWorkTypeEXchange.push(TokenAmountGroupByWorkType);
        }

    }

    return TokenAmountGroupByWorkTypeEXchange;
    function gen_SqlRight(endTimeStamp , startTimeStamp,workTypes) {
        console.log("workTypes:",workTypes);
        return util.format("SELECT\n" +
            "\t*\n" +
            "FROM\n" +
            "\t(\n" +
            "\t\tSELECT\n" +
            "\t\t\tToken.baseInfo_workType, \n" +
            "\t\t\tCOUNT(Token.baseInfo_workId) AS num\n" +
            "\t\tFROM\n" +
            "\t\t\tToken\n" +
            "\t\tWHERE\n" +
            "\t\t\tToken.baseInfo_timestamp <= %s AND\n" +
            "\t\t\tToken.baseInfo_timestamp > %s AND\n" +
            "\t\t\t(\n" +
            "\t\t\t  Token.baseInfo_workType = %s OR\n" +
            "\t\t\t  Token.baseInfo_workType = %s OR\n" +
            "\t\t\t  Token.baseInfo_workType = %s\n" +
            "\t\t\t)\n" +
            "\t\tGROUP BY\n" +
            "\t\t\tToken.baseInfo_workType\n" +
            "\t) AS Type\n"
            ,endTimeStamp , startTimeStamp, workTypes[0], workTypes[1], workTypes[2])

    }
    async function countGroupBy(c, table, byKey, endTimeStamp = null,startTimeStamp = null,
                                timeName = "baseInfo_timestamp"){
        let sqlRight = _sqlGroupBy(table, byKey , endTimeStamp , startTimeStamp ,timeName);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        let Res = {};
        sqlRes.forEach(value =>
            Res[[value[byKey]]] = value['num']
        );
        return Res;
    }

    function _sqlGroupBy(table, byKey , endTimeStamp , startTimeStamp , timeName) {
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
            table, byKey,
            table, byKey,
            table);

        if(endTimeStamp != null){
            sqlRight = sqlRight+util.format(
                '\t\tWHERE\n' +
                '\t\t\t%s.%s <= %s AND\n' +
                '\t\t\t%s.%s > %s\n',
                table,timeName,endTimeStamp,
                table,timeName,startTimeStamp);
        }

        sqlRight = sqlRight + util.format(
            '\t\tGROUP BY\n' +
            '\t\t\t%s.%s\n' +
            '\t) AS Type\n'
            ,table, byKey,);
        return sqlRight;
    }
}

// 通证的时间分布/月
export async function handleTokenAmountEXchange(extraData) {
    // if(checkDBConnected()==false)return "err"
    console.time('handleTokenAmountEXchange');
    let sqlRes = await getTokenAmountEXchange(extraData);
    console.timeEnd('handleTokenAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getTokenAmountEXchange(extraData) {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    if(true)console.log("TimeStampArray:", TimeStampArray)
    // console.log([TimeStampArray, MonthArray]);
    let TokenAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let valueRes = await countNum(c1,"Token", "baseInfo_workId",endTimeStamp,startTimeStamp);
        if(CONNECT == false)valueRes = 0;
        let MonthInfo = {
            "TokenAmount": (valueRes["num"] + Number(extraData[12- index]["works"]["total"])),
            "Month" : MonthArray[index + 1],
        };
        TokenAmountEXchange.push(MonthInfo);
    }
    TokenAmountEXchange.reverse();
    console.log(TokenAmountEXchange);
    return TokenAmountEXchange;
}

// 不同作品类型的通证分布
export async function handleTokenAmountGroupByWorkType(extraData) {

    console.time('handleTokenAmountGroupByWorkType');
    let sqlRes = await getTokenAmountGroupByWorkType(extraData);
    console.timeEnd('handleTokenAmountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getTokenAmountGroupByWorkType(extraData) {
    let TokenAmountGroupByWorkType = [];
    let WorkTypeInfo = {};

    if(CONNECT == true){
        // 北邮的数据库是按全部，而北版是按一年算，虽然结题时是不到一年的数据
        let Res = await countGroupBy(c1, "Token", "baseInfo_workType");
        console.log("Res:",Res);

        let RawRes = {};
        let keys = Object.keys(WORKTYPE);
        keys.forEach(value =>
            RawRes[value] = Number(Res[value])?Number(Res[value]):0
        );
        let extraDataKeys = Object.keys(extraData)
        extraDataKeys.forEach(Month =>
            keys.forEach(value =>
                RawRes[value] = RawRes[value] + (Number(extraData[Month]["works"]["workType"][value])?Number(extraData[Month]["works"]["workType"][value]):0)
            )
        );
        console.log("RawRes:",RawRes);
        
        // 字典取三个最大值
        let resTemp = Object.keys(RawRes).sort(function(a,b){ return RawRes[b] - RawRes[a];             });
        let resMax = resTemp.slice(0,3);
        resTemp.splice(0,3);
        console.log("resMax:",resMax);
        console.log("resTemp:",resTemp);

        resMax.forEach(key=>{
            WorkTypeInfo = {
                "workType":WORKTYPE[key],
                "TokenAmount":RawRes[key]
            };
            TokenAmountGroupByWorkType.push(WorkTypeInfo);
        })
        let spareNum = 0;
        resTemp.forEach(key=>{
            spareNum += RawRes[key];
        })
        WorkTypeInfo = {
            "workType":"剩余的",
            "TokenAmount":spareNum
        };
        TokenAmountGroupByWorkType.push(WorkTypeInfo);
        console.log("TokenAmountGroupByWorkType:",TokenAmountGroupByWorkType);
    }
    else{
        TokenAmountGroupByWorkType = [{
                "workType":"音乐",
                "TokenAmount":0
            },{
                "workType":"电影",
                "TokenAmount":0
            },{
                "workType":"美术",
                "TokenAmount":0
            }]
    }

    return TokenAmountGroupByWorkType;

    async function countGroupBy(c, table, byKey){
        let sqlRight = _sqlGroupBy(table, byKey);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        let Res = {};
        sqlRes.forEach(value =>
            Res[[value[byKey]]] = value['num']
        );
        return Res;
    }

    function _sqlGroupBy(table, byKey) {
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
            table, byKey,
            table, byKey,
            table);
        sqlRight = sqlRight + util.format(
            '\t\tGROUP BY\n' +
            '\t\t\t%s.%s\n' +
            '\t) AS Type\n' +
            'ORDER BY\n' +
            '\tnum DESC\n'
            ,table, byKey);
        return sqlRight;
    }
}

// 不同著作权产生方式的通证分布
export async function handleTokenAmountGroupByCreateType(extraData) {

    console.time('handleTokenAmountGroupByCreateType');
    let sqlRes = await getTokenAmountGroupByCreateType(extraData);
    console.timeEnd('handleTokenAmountGroupByCreateType');
    console.log('--------------------');
    return sqlRes;
}
async function getTokenAmountGroupByCreateType(extraData) {
    let TokenAmountGroupByCreateType = {};
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(Token.baseInfo_workId) AS num, \n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'FROM\n' +
            '\tToken\n' +
            'GROUP BY\n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'ORDER BY\n' +
            '\tToken.baseInfo_copyrightCreateType');
        let sqlRes = await mysqlUtils.sql(c1, sqlRight);
        let AmountGroup = {};// 对应序号的字典 0-个人1-合作2-法人3-职务4-委托
        sqlRes.forEach(function(item,index){
            AmountGroup[item['baseInfo_copyrightCreateType']] = item['num'];
        });
        let RawRes = {};
        let keys = Object.keys(COPYRIGHTCREATETYPE);
        keys.forEach(value =>
            RawRes[value] = Number(AmountGroup[value])?Number(AmountGroup[value]):0
        );
        let extraDataKeys = Object.keys(extraData)
        extraDataKeys.forEach(Month =>
            keys.forEach(value =>
                RawRes[value] = RawRes[value] + (Number(extraData[Month]["works"]["copyrightCreateType"][value])?Number(extraData[Month]["works"]["copyrightCreateType"][value]):0)
            )
        );
        console.log("RawRes:",RawRes);

        TokenAmountGroupByCreateType = {
            "个人" : RawRes[0],
            "合作" : RawRes[1],
            "法人" : RawRes[2],
            "职务" : RawRes[3],
            "委托" : RawRes[4]
        }
    }
    let index = 0;
    while(index<5){
        if(!TokenAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]]){
            TokenAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]] = 0;
        }
        index ++;
    }
    if(true)console.log(TokenAmountGroupByCreateType);// 数据返回

    return TokenAmountGroupByCreateType;
}

// 合作企业的通证分布
export async function handleTokenAmountGroupByCooperator(extraData) {

    console.time('handleTokenAmountGroupByCooperator');
    // let sqlRes = await getTokenAmountGroupByCooperator(extraData);
    let sqlRes = {"orgWorks":{
            "orgWorks": [
                {
                    "num": 64183,
                    "org_name": "北京汉仪创新科技股份有限公司"
                },
                {
                    "num": 1403,
                    "org_name": "北京优图佳视影像网络科技有限公司"
                },
                {
                    "num": 1099,
                    "org_name": "北京百度网讯科技有限公司"
                },
                {
                    "num": 121,
                    "org_name": "九天星韵（北京）文化发展有限公司"
                },
                {
                    "num": 73,
                    "org_name": "北京学测星教育科技有限公司"
                },
                {
                    "num": 42,
                    "org_name": "北京智创科技有限公司"
                },
                {
                    "num": 41,
                    "org_name": "央视动漫集团有限公司"
                },
                {
                    "num": 33,
                    "org_name": "北京神舟航天文化创意传媒有限责任公司"
                },
                {
                    "num": 19,
                    "org_name": "北京唯图文化交流发展有限公司"
                },
                {
                    "num": 101,
                    "org_name": "其他"
                }
            ]
        }};
    console.timeEnd('handleTokenAmountGroupByCooperator');
    console.log('--------------------');
    return sqlRes;
}
async function getTokenAmountGroupByCooperator(extraData) {
    let TokenAmountGroupByCreateType = {};
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(Token.baseInfo_workId) AS num, \n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'FROM\n' +
            '\tToken\n' +
            'GROUP BY\n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'ORDER BY\n' +
            '\tToken.baseInfo_copyrightCreateType');
        let sqlRes = await mysqlUtils.sql(c1, sqlRight);
        let AmountGroup = {};// 对应序号的字典 0-个人1-合作2-法人3-职务4-委托
        sqlRes.forEach(function(item,index){
            AmountGroup[item['baseInfo_copyrightCreateType']] = item['num'];
        });
        let RawRes = {};
        let keys = Object.keys(COPYRIGHTCREATETYPE);
        keys.forEach(value =>
            RawRes[value] = Number(AmountGroup[value])?Number(AmountGroup[value]):0
        );
        let extraDataKeys = Object.keys(extraData)
        extraDataKeys.forEach(Month =>
            keys.forEach(value =>
                RawRes[value] = RawRes[value] + (Number(extraData[Month]["works"]["copyrightCreateType"][value])?Number(extraData[Month]["works"]["copyrightCreateType"][value]):0)
            )
        );
        console.log("RawRes:",RawRes);

        TokenAmountGroupByCreateType = {
            "个人" : RawRes[0],
            "合作" : RawRes[1],
            "法人" : RawRes[2],
            "职务" : RawRes[3],
            "委托" : RawRes[4]
        }
    }
    let index = 0;
    while(index<5){
        if(!TokenAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]]){
            TokenAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]] = 0;
        }
        index ++;
    }
    if(true)console.log(TokenAmountGroupByCreateType);// 数据返回

    return TokenAmountGroupByCreateType;
}

// 通证总数
export async function handleTokenAmount(extraData) {

    console.time('handleTokenAmount');
    let sqlRes = 50;//await getTokenAmount(extraData);
    console.timeEnd('handleTokenAmount');
    console.log('--------------------');
    return sqlRes;
}
async function getTokenAmount(extraData) {
    let TokenAmountGroupByCreateType = {};
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(Token.baseInfo_workId) AS num, \n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'FROM\n' +
            '\tToken\n' +
            'GROUP BY\n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'ORDER BY\n' +
            '\tToken.baseInfo_copyrightCreateType');
        let sqlRes = await mysqlUtils.sql(c1, sqlRight);
        let AmountGroup = {};// 对应序号的字典 0-个人1-合作2-法人3-职务4-委托
        sqlRes.forEach(function(item,index){
            AmountGroup[item['baseInfo_copyrightCreateType']] = item['num'];
        });
        let RawRes = {};
        let keys = Object.keys(COPYRIGHTCREATETYPE);
        keys.forEach(value =>
            RawRes[value] = Number(AmountGroup[value])?Number(AmountGroup[value]):0
        );
        let extraDataKeys = Object.keys(extraData)
        extraDataKeys.forEach(Month =>
            keys.forEach(value =>
                RawRes[value] = RawRes[value] + (Number(extraData[Month]["works"]["copyrightCreateType"][value])?Number(extraData[Month]["works"]["copyrightCreateType"][value]):0)
            )
        );
        console.log("RawRes:",RawRes);

        TokenAmountGroupByCreateType = {
            "个人" : RawRes[0],
            "合作" : RawRes[1],
            "法人" : RawRes[2],
            "职务" : RawRes[3],
            "委托" : RawRes[4]
        }
    }
    let index = 0;
    while(index<5){
        if(!TokenAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]]){
            TokenAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]] = 0;
        }
        index ++;
    }
    if(true)console.log(TokenAmountGroupByCreateType);// 数据返回

    return TokenAmountGroupByCreateType;
}