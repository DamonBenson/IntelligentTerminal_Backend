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
import {c} from "../MidBackend.js";
import {debugMode, WORKTYPE, COPYRIGHTTYPE, COPYRIGHTCREATETYPE, CREATIONTYPE} from '../utils/info.js';
import {countGroupBy, countNumJoinRight, countNum, countNumJoinRightAll} from "./SelectUtil.js";

const CONNECT = true;// When false, Send Random Response
// export{
//     handleCertificateAmountEXchange,// 1）	存证总数量随时间的变化。
//     handleCertificateAmountGroupByWorkType,// 2）	截止当前不同作品类型。workType
//     handleCertificateAmountGroupByWorkTypeEXchange,// 3）	不同作品类型的存证数量随时间的变化。workType
//     handleCopyRightAmountEXchange,// 1）	版权通证总数量随时间的变化。 Amount
//     handleCopyRightAmountGroupByIDtype,// 1）	截止当前，在已生成的全部版权通证中，个人账户作为存证时的版权接收者 id_type
//     handleCopyRightAmountGroupByCopyrightType// 1)	截止当前，不同类别通证的数量分布。 copyrightType Amount
// }
//*****************************************************************************************************//
// 新方案
// 1.1 存证总数量随时间变化 折线图
// 1.2 当前不同作品类型存证数量分布饼图
// 1.3 最大的三种作品类型的存证数量随时间的变化
// 2.1 版权通证总数量随时间变化 折线图
// 3.1 个人账户与非个人账户接收者通证数量对比
// 4.1 截止当前，不同类别通证的数量分布饼图
//*****************************************************************************************************//
// 1.	存证信息-作品信息
// 一维图（一个自变量）
// 1）	存证总数量随时间的变化。
export async function handleCertificateAmountEXchange(req, res) {

    console.time('handleCertificateAmountEXchange');
    let sqlRes = await getCertificateAmountEXchange();
    console.timeEnd('handleCertificateAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    if(true)console.log("TimeStampArray:", TimeStampArray)
    // console.log([TimeStampArray, MonthArray]);
    let CertificateAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let valueRes = await countNum("Token", "baseInfo_workId",endTimeStamp,startTimeStamp);
        if(CONNECT == false)valueRes = 0;
        let MonthInfo = {
            "CertificateAmount": valueRes["num"],
            "Month" : MonthArray[index + 1],
        };
        CertificateAmountEXchange.push(MonthInfo);
    }
    CertificateAmountEXchange.reverse();
    console.log(CertificateAmountEXchange);
    return CertificateAmountEXchange;
}

// 2）	截止当前不同作品类型
export async function handleCertificateAmountGroupByWorkType(req, res) {

    console.time('handleCertificateAmountGroupByWorkType');
    let sqlRes = await getCertificateAmountGroupByWorkType();
    console.timeEnd('handleCertificateAmountGroupByWorkType');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByWorkType() {
    let CertificateAmountGroupByWorkType = [];
    let WorkTypeInfo = {};

    if(CONNECT == true){
        let Res = await countGroupBy("Token", "baseInfo_workType");
        console.log("Res:",Res);
        let keys = Object.keys(Res);
        console.log("keys:",keys);
        for (let i = 0, n = keys.length, key; i < n; ++i) {
            key = keys[i];
            WorkTypeInfo = {
                "workType":WORKTYPE[key],
                "CertificateAmount":Res[key]
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
        }
        console.log("CertificateAmountGroupByWorkType:",CertificateAmountGroupByWorkType);
    }
    else{
        CertificateAmountGroupByWorkType = [{
                "workType":"音乐",
                "CertificateAmount":0
            },{
                "workType":"电影",
                "CertificateAmount":0
            },{
                "workType":"美术",
                "CertificateAmount":0
            }]
    }

    return CertificateAmountGroupByWorkType;
}

// 3）	不同作品类型的存证数量随时间的变化。workType
export async function handleCertificateAmountGroupByWorkTypeEXchange(req, res) {

    console.time('handleCertificateAmountGroupByWorkTypeEXchange');
    let sqlRes = await getCertificateAmountGroupByWorkTypeEXchange();


    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCertificateAmountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByWorkTypeEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getSeasonTimeStampArray();
    let CertificateAmountGroupByWorkTypeEXchange = [];
    let CertificateAmountGroupByWorkType = [];
    let SeasonGap = 1;
    let WorkTypeInfo = {};
    // console.log([TimeStampArray, MonthArray]);
    if(CONNECT == true){
        let index = 0;
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        console.log(TimeStampArray);
        let keys = [];
        while(keys.length<3 && index<3){//寻找出现最多的属性，如果当前季节找不到3个有效结果，则往前面的季节找。只调用1年的数据。
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            let Res = await countGroupBy("Token", "baseInfo_workType", endTimeStamp ,startTimeStamp);
            //寻找最大的季节
            let TempKeys = Object.keys(Res);
            if(TempKeys.length>keys){keys = Object.keys(Res)};
            //只调用1年的数据
            index = index + SeasonGap;
        }
        // keys不足补齐
        if(keys.length<3){
            let temp = 1;
            while(keys.length<3){
                if(keys.findIndex(function (nums) {return nums == temp})){
                    keys.push(temp.toString());
                }
                temp++;
            }
            console.log("keys:",keys);
        }
        for (let index = 0; index < 4; index = index + SeasonGap) {
            endTimeStamp = TimeStampArray[index];
            startTimeStamp = TimeStampArray[(index + 1)];
            // let Res = await countGroupBy("Token", "baseInfo_workType",endTimeStamp ,startTimeStamp);
            let sqlRight = gen_SqlRight(endTimeStamp , startTimeStamp, keys);
            let sqlRes = await mysqlUtils.sql(c, sqlRight);
            let Res = {};
            sqlRes.forEach(value =>
                Res[[value["baseInfo_workType"]]] = value['num']
            );
            CertificateAmountGroupByWorkType =[];
            for (let i = 0, n = keys.length, key; i < n; ++i) {
                key = keys[i];
                //空返回补0
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "workType":WORKTYPE[key],
                    "CertificateAmount":Res[key],
                    "Month" : MonthArray[index],
                };
                CertificateAmountGroupByWorkType.push(MonthInfo);
            }
            CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);

        }
        console.log(CertificateAmountGroupByWorkTypeEXchange);
    }
    else{
        for (let index = 0; index < 3; index = index + SeasonGap) {
            let CertificateAmountGroupByWorkType = [];

            WorkTypeInfo = {
                "workType":"音乐",
                "CertificateAmount":localUtils.randomNumber(80,100),
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"电影",
                "CertificateAmount":localUtils.randomNumber(60,80),
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"美术",
                "CertificateAmount":localUtils.randomNumber(40,60),
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);
        }

    }

    CertificateAmountGroupByWorkTypeEXchange.reverse();
    return CertificateAmountGroupByWorkTypeEXchange;
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
}

// 1）	版权通证总数量随时间的变化。 Amount
export async function handleCopyRightAmountEXchange(req, res) {

    console.time('handleCopyRightAmountEXchange');
    let sqlRes = await getCopyRightAmountEXchange();
    console.timeEnd('handleCopyRightAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getCopyRightAmountEXchange() {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    let CopyRightAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let valueRes = await countNum("CopyrightToken", "workId",endTimeStamp,startTimeStamp);
        let MonthInfo = {
            "CopyRightAmount": valueRes["num"],
            "Month" : MonthArray[index + 1],
        };
        CopyRightAmountEXchange.push(MonthInfo);
    }
    CopyRightAmountEXchange.reverse();
    console.log(CopyRightAmountEXchange);
    return CopyRightAmountEXchange;
}

//** 1）	截止当前，在已生成的全部版权通证中，个人账户作为存证时的版权接收者（版权持有者证件类型为居民身份证、军官证与护照）**//
// 与非个人账户作为存证时的版权接收者（版权持有者证件类型为营业执照、企业法人营业执照、组织机构代码证书、事业单位法人证书、社团法人证书、其他有效证件）
// 的通证数量分布。 id_type
// 1..9   1.2.4为个人
// export async function handleCopyRightAmountGroupByIDtype(req, res) {
//
//     console.time('handleCopyRightAmountGroupByIDtype');
//     let sqlRes = await getCopyRightAmountGroupByIDtype();
//     console.timeEnd('handleCopyRightAmountGroupByIDtype');
//     console.log('--------------------');
//     return sqlRes;
// }
// //TODO 证件类型为何删除？
// async function getCopyRightAmountGroupByIDtype() {
//     let CopyRightAmountGroupByIDtype = {};
//     if(CONNECT == false & false){
//         CopyRightAmountGroupByIDtype = {
//             "个人账户数目" : localUtils.randomNumber(300,500),
//             "非个人账户数目": localUtils.randomNumber(600,1000),
//         };
//     }
//     else{
//         let sqlRight =util.format(
//             'SELECT\n' +
//             '\tCOUNT(CopyrightToken.TokenId) AS num\n' +
//             'FROM\n' +
//             '\tCopyrightToken\n' +
//             'WHERE\n' +
//             '\tCopyrightToken.id_type = 3 OR \n' +
//             '\tCopyrightToken.id_type = 5 OR \n' +
//             '\tCopyrightToken.id_type = 6 OR \n' +
//             '\tCopyrightToken.id_type = 7 OR \n' +
//             '\tCopyrightToken.id_type = 8 OR \n' +
//             '\tCopyrightToken.id_type = 9');
//         console.log(sqlRight);
//         let sqlRes = await mysqlUtils.sql(c, sqlRight);
//         console.log(sqlRes);
//         let InPersonalNum = 0;
//         sqlRes.forEach(function(item,index){
//             InPersonalNum = item['num'];
//         });
//         sqlRight =util.format(
//             'SELECT\n' +
//             '\tCOUNT(CopyrightToken.TokenId) AS num\n' +
//             'FROM\n' +
//             '\tCopyrightToken\n' +
//             'WHERE\n' +
//             '\tCopyrightToken.id_type = 1 OR \n' +
//             '\tCopyrightToken.id_type = 2 OR \n' +
//             '\tCopyrightToken.id_type = 4');
//         console.log(sqlRight);
//         sqlRes = await mysqlUtils.sql(c, sqlRight);
//         console.log(sqlRes);
//         let PersonalNum = 0;
//         sqlRes.forEach(function(item,index){
//             PersonalNum = item['num'];
//         });
//
//         CopyRightAmountGroupByIDtype = {
//             "个人账户数目" : PersonalNum,
//             "非个人账户数目": InPersonalNum,
//         };
//     }
//     return CopyRightAmountGroupByIDtype;
// }




//*不同著作权产生方式存证的分布*//
export async function handleCertificateAmountGroupByCreateType(req, res) {

    console.time('handleCertificateAmountGroupByCreateType');
    let sqlRes = await getCertificateAmountGroupByCreateType();
    console.timeEnd('handleCertificateAmountGroupByCreateType');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByCreateType() {
    let CertificateAmountGroupByCreateType = {};
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
        if(false)console.log("sqlRight:",sqlRight);// SQL语句
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        if(false)console.log(sqlRes);// SQL返回
        let AmountGroup = {};// 对应序号的字典 0-个人1-合作2-法人3-职务4-委托
        sqlRes.forEach(function(item,index){
            AmountGroup[item['baseInfo_copyrightCreateType']] = item['num'];
        });
        console.log(AmountGroup);
        CertificateAmountGroupByCreateType = {
            "个人" : AmountGroup[0],
            "合作" : AmountGroup[1],
            "法人" : AmountGroup[2],
            "职务" : AmountGroup[3],
            "委托" : AmountGroup[4],
        }
    }
    let index = 0;
    while(index<5){
        if(!CertificateAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]]){
            CertificateAmountGroupByCreateType[COPYRIGHTCREATETYPE[index]] = 0;
        }
        index ++;
    }
    if(true)console.log(CertificateAmountGroupByCreateType);// 数据返回

    return CertificateAmountGroupByCreateType;
}
// 二维图（两个自变量）
// 2）	不同类型的账户作为版权通证接收者的通证数量随时间的变化。 IDType NeedTime
// 4.	版权信息-copyrightType
// 一维图（一个自变量）
// 1)	截止当前，不同类别通证的数量分布。 copyrightType Amount
export async function handleCopyRightAmountGroupByCopyrightType(req, res) {

    console.time('handleCopyRightAmountGroupByCopyrightType');
    let sqlRes = await getCopyRightAmountGroupByCopyrightType();
    console.timeEnd('handleCopyRightAmountGroupByCopyrightType');
    console.log('--------------------');
    return sqlRes;
}
async function getCopyRightAmountGroupByCopyrightType() {
    let CopyRightAmountGroupByIDtype = {};
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(CopyrightToken.TokenId) AS num, \n' +
            '\tCopyrightToken.copyrightType\n' +
            'FROM\n' +
            '\tCopyrightToken\n' +
            'GROUP BY\n' +
            '\tCopyrightToken.copyrightType\n' +
            'ORDER BY\n' +
            '\tCopyrightToken.copyrightType');
        console.log(sqlRight);
        let sqlRes = await mysqlUtils.sql(c, sqlRight);
        console.log(sqlRes);
        let AmountGroup = {};
        sqlRes.forEach(function(item,index){
            AmountGroup[item['copyrightType']] = item['num'];
        });
        console.log(AmountGroup);
        CopyRightAmountGroupByIDtype = {
            "复制权" : AmountGroup[1],
            "发行权" : AmountGroup[2],
            "出租权" : AmountGroup[3],
            "展览权" : AmountGroup[4],
            "表演权" : AmountGroup[5],
            "放映权" : AmountGroup[6],
            "广播"   : AmountGroup[7],
            "信息网络传播权" : AmountGroup[8],
            "摄制权" : AmountGroup[9],
            "改编权" : AmountGroup[10],
            "翻译权" : AmountGroup[11],
            "汇编权" : AmountGroup[12],
            "其他"   : AmountGroup[13]
        }
    }
    let index = 0;
    while(index<13){
        if(!CopyRightAmountGroupByIDtype[COPYRIGHTTYPE[index]]){
            CopyRightAmountGroupByIDtype[COPYRIGHTTYPE[index]] = 0;
        }
        index ++;
    }

    return CopyRightAmountGroupByIDtype;
}
