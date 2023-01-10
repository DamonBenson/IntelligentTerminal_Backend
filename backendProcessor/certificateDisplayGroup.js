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
export async function handleCertificateAmountGroupByWorkTypeEXchange(extraData) {

    console.time('handleCertificateAmountGroupByWorkTypeEXchange');
    let sqlRes = await getCertificateAmountGroupByWorkTypeEXchange(extraData);


    // let resJson = JSON.stringify(sqlRes);
    console.timeEnd('handleCertificateAmountGroupByWorkTypeEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByWorkTypeEXchange(extraData) {
    let [TimeStampArray,MonthArray] = DateUtil.getSeasonTimeStampArray();
    MonthArray.pop();
    MonthArray.reverse();
    let CertificateAmountGroupByWorkTypeEXchange = [];
    let CertificateAmountGroupByWorkType = [];
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
            CertificateAmountGroupByWorkType =[];
            for (let i = 0, n = keys.length, key; i < n; ++i) {
                key = keys[i];
                //空返回补0
                if(Res[key]==null)Res[key]=0;
                let MonthInfo = {
                    "workType":WORKTYPE[key],
                    "CertificateAmount":Res[key]
                        + (Number(extraData[index*3+1]["works"]["workType"][key])?Number(extraData[index*3+1]["works"]["workType"][key]):0)
                        + (Number(extraData[index*3+2]["works"]["workType"][key])?Number(extraData[index*3+2]["works"]["workType"][key]):0)
                        + (Number(extraData[index*3+3]["works"]["workType"][key])?Number(extraData[index*3+3]["works"]["workType"][key]):0),
                    "Month" : MonthArray[index],
                };
                CertificateAmountGroupByWorkType.push(MonthInfo);
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
                "CertificateAmount":spareSum,
                "Month" : MonthArray[index],
            };
            CertificateAmountGroupByWorkType.push(MonthInfo);
            CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);

        }
        console.log(CertificateAmountGroupByWorkTypeEXchange);
    }
    else{
        for (let index = 0; index < 3; index = index + SeasonGap) {
            let CertificateAmountGroupByWorkType = [];

            WorkTypeInfo = {
                "workType":"音乐",
                "CertificateAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"电影",
                "CertificateAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"美术",
                "CertificateAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            WorkTypeInfo = {
                "workType":"剩余的",
                "CertificateAmount":0,
                "Month" : MonthArray[index + SeasonGap],
            };
            CertificateAmountGroupByWorkType.push(WorkTypeInfo);
            CertificateAmountGroupByWorkTypeEXchange.push(CertificateAmountGroupByWorkType);
        }

    }

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
            "\t\t\Token\n" +
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
export async function handleCertificateAmountEXchange(extraData) {
    // if(checkDBConnected()==false)return "err"
    console.time('handleCertificateAmountEXchange');
    let sqlRes = await getCertificateAmountEXchange(extraData);
    console.timeEnd('handleCertificateAmountEXchange');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountEXchange(extraData) {
    let [TimeStampArray,MonthArray] = DateUtil.getMonthTimeStampArray();
    if(true)console.log("TimeStampArray:", TimeStampArray)
    // console.log([TimeStampArray, MonthArray]);
    let CertificateAmountEXchange = [];
    for (let index = 0; index < 12; index++) {
        let endTimeStamp = TimeStampArray[index];
        let startTimeStamp = TimeStampArray[(index + 1)];
        let valueRes = await countNum(c1,"Token", "baseInfo_workId",endTimeStamp,startTimeStamp);
        if(CONNECT == false)valueRes = 0;
        let MonthInfo = {
            "CertificateAmount": (valueRes["num"] + Number(extraData[12- index]["works"]["total"])),
            "Month" : MonthArray[index + 1],
        };
        CertificateAmountEXchange.push(MonthInfo);
    }
    CertificateAmountEXchange.reverse();
    console.log(CertificateAmountEXchange);
    return CertificateAmountEXchange;
}

// 不同著作权类型的证书分布
export async function handleCertificateAmountGroupByCopyrightType(extraData) {

    console.time('handleCopyRightAmountGroupByCopyrightType');
    let sqlRes = await getCertificateAmountGroupByCopyrightType(extraData);
    console.timeEnd('handleCopyRightAmountGroupByCopyrightType');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByCopyrightType(extraData) {
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
        let sqlRes = await mysqlUtils.sql(c1, sqlRight);
        console.log(sqlRes);
        let AmountGroup = {};
        sqlRes.forEach(function(item,index){
            AmountGroup[item['copyrightType']] = item['num'];
        });
        console.log(AmountGroup);
        let RawRes = {};
        let keys = Object.keys(COPYRIGHTTYPE);
        keys.forEach(value =>
            RawRes[value] = Number(AmountGroup[value])?Number(AmountGroup[value]):0
        );
        let extraDataKeys = Object.keys(extraData)
        extraDataKeys.forEach(Month =>
            keys.forEach(value =>
                RawRes[value] = RawRes[value] + (Number(extraData[Month]["cert"]["copyrightType"][value])?Number(extraData[Month]["cert"]["copyrightType"][value]):0)
            )
        );
        console.log("RawRes:",RawRes);
        CopyRightAmountGroupByIDtype = {
            "复制权" : RawRes[4],
            "发行权" : RawRes[5],
            "出租权" : RawRes[6],
            "展览权" : RawRes[7],
            "表演权" : RawRes[8],
            "放映权" : RawRes[9],
            "广播"   : RawRes[10],
            "信息网络传播权" : RawRes[11],
            "摄制权" : RawRes[12],
            "改编权" : RawRes[13],
            "翻译权" : RawRes[14],
            "汇编权" : RawRes[15],
            "其他"   : RawRes[16]
        }
    }
    let index = 0;
    while(index<13){
        if(!CopyRightAmountGroupByIDtype[COPYRIGHTTYPE[index+4]]){
            CopyRightAmountGroupByIDtype[COPYRIGHTTYPE[index+4]] = 0;
        }
        index ++;
    }

    return CopyRightAmountGroupByIDtype;
}

// 不同著作权产生方式的通证分布
export async function handleCertificateAmountGroupByCreateType(extraData) {

    console.time('handleCertificateAmountGroupByCreateType');
    let sqlRes = await getCertificateAmountGroupByCreateType(extraData);
    console.timeEnd('handleCertificateAmountGroupByCreateType');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByCreateType(extraData) {
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

        CertificateAmountGroupByCreateType = {
            "个人" : RawRes[0],
            "合作" : RawRes[1],
            "法人" : RawRes[2],
            "职务" : RawRes[3],
            "委托" : RawRes[4]
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

// 合作企业的通证分布
export async function handleCertificateAmountGroupByCooperator(extraData) {

    console.time('handleCertificateAmountGroupByCooperator');
    // let sqlRes = await getCertificateAmountGroupByCooperator(extraData);
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
    console.timeEnd('handleCertificateAmountGroupByCooperator');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmountGroupByCooperator(extraData) {
    let CertificateAmountGroupByCreateType = {};
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(Token.baseInfo_workId) AS num, \n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'FROM\n' +
            '\Token\n' +
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

        CertificateAmountGroupByCreateType = {
            "个人" : RawRes[0],
            "合作" : RawRes[1],
            "法人" : RawRes[2],
            "职务" : RawRes[3],
            "委托" : RawRes[4]
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

// 通证总数
export async function handleCertificateAmount(extraData) {

    console.time('handleCertificateAmount');
    let sqlRes = 50;//await getCertificateAmount(extraData);
    console.timeEnd('handleCertificateAmount');
    console.log('--------------------');
    return sqlRes;
}
async function getCertificateAmount(extraData) {
    let CertificateAmountGroupByCreateType = {};
    if(CONNECT == true){
        let sqlRight =util.format(
            'SELECT\n' +
            '\tCOUNT(Token.baseInfo_workId) AS num, \n' +
            '\tToken.baseInfo_copyrightCreateType\n' +
            'FROM\n' +
            '\Token\n' +
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

        CertificateAmountGroupByCreateType = {
            "个人" : RawRes[0],
            "合作" : RawRes[1],
            "法人" : RawRes[2],
            "职务" : RawRes[3],
            "委托" : RawRes[4]
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








