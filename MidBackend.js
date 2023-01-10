import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as authDisplayGroup from './backendProcessor/authDisplayGroup.js';
import * as tokenDisplayGroup from './backendProcessor/tokenDisplayGroup.js';
import * as certificateDisplayGroup from './backendProcessor/certificateDisplayGroup.js';
import * as listenDisplayGroup from './backendProcessor/listenDisplayGroup.js';
import * as httpUtils from './utils/httpUtils.js';
import * as localUtils from './utils/localUtils.js';
import mysql from 'mysql';
import util from 'util';
import {MOVIE_WORKTYPE, MUSIC_WORKTYPE, mysqlConf1, PICTURE_WORKTYPE} from './utils/info.js';
import {mysqlConf2} from './utils/info.js';
import sha256 from 'crypto-js/sha256.js';
import fs from "fs";
import * as mysqlUtils from "./utils/mysqlUtils.js";
export const c1 = mysql.createConnection(mysqlConf1);
const reconnectInterval = 5000;//5s60*60000;//1h
const pulseInterval = 60000;//1min
const updateExtraDataeInterval = 5000;//5s

const debugMode = false;
const SAVEPATH = './ExtraData'

//  更新版权局数据
async function updateExtraData(savePath = SAVEPATH) {
    const url = 'https://verify.wespace.cn/by/queryStatisticsData';
    const param = {date: ""};
    let resInfo = await httpUtils.postFormData(url, param);
    resInfo = JSON.parse(resInfo);
    if(resInfo['code'] === 200){
        if(debugMode)console.log('北版数据:',JSON.stringify(resInfo.data));
        Object.keys(resInfo.data).forEach(Month=>{
            let NewCopyrightType={};
            constructNewCopyrightType(NewCopyrightType);
            Object.keys(resInfo.data[Month]["cert"]["copyrightType"]).forEach(value => {
                switch(value) {
                    case "13":formNewCopyrightType(NewCopyrightType, Number(resInfo.data[Month]["cert"]["copyrightType"]["13"]));break;
                    case "16":formNewCopyrightType(NewCopyrightType, Number(resInfo.data[Month]["cert"]["copyrightType"]["16"]));break;
                    case "17":formNewCopyrightType(NewCopyrightType, Number(resInfo.data[Month]["cert"]["copyrightType"]["17"]));break;
                }
            })
            resInfo.data[Month]["cert"]["copyrightType"] = NewCopyrightType;
        })
        fs.writeFileSync(savePath,JSON.stringify(resInfo.data));
        function constructNewCopyrightType(NewCopyrightType){
            NewCopyrightType["4"] = 0;
            NewCopyrightType["5"] = 0;
            NewCopyrightType["6"] = 0;
            NewCopyrightType["7"] = 0;
            NewCopyrightType["8"] = 0;
            NewCopyrightType["9"] = 0;
            NewCopyrightType["10"] = 0;
            NewCopyrightType["11"] = 0;
            NewCopyrightType["12"] = 0;
            NewCopyrightType["13"] = 0;
            NewCopyrightType["14"] = 0;
            NewCopyrightType["15"] = 0;
            NewCopyrightType["16"] = 0;
        }
        function formNewCopyrightType(NewCopyrightType, number){
            NewCopyrightType["4"] += number;
            NewCopyrightType["5"] += number;
            NewCopyrightType["6"] += number;
            NewCopyrightType["7"] += number;
            NewCopyrightType["8"] += number;
            NewCopyrightType["9"] += number;
            NewCopyrightType["10"] += number;
            NewCopyrightType["11"] += number;
            NewCopyrightType["12"] += number;
            NewCopyrightType["13"] += number;
            NewCopyrightType["14"] += number;
            NewCopyrightType["15"] += number;
            NewCopyrightType["16"] += number;
        }
    }
    else{
        console.log('北版数据获取失败:',JSON.stringify(resInfo.data));
    }

}
await updateExtraData();
/**
 * @description 读取版权局数据
 * @returns {JSON} 北版数据JSON
 */
function readExtraData(savePath = SAVEPATH) {
    let JsonData = fs.readFileSync(savePath);
    return JSON.parse(JsonData.toString());
}
let  extraData = readExtraData();
console.log('北版数据读取:',JSON.stringify(extraData));

setInterval(async() => {
    await updateExtraData();
    extraData = readExtraData();
    console.log('北版数据读取:',JSON.stringify(extraData));
}, pulseInterval);



await c1.connect(err =>console.log('存证确权数据库连接情况:', err));
// setInterval(async function() {
//     await c1.destroy();
//
//     console.log("存证确权数据库释放中");
//     await sleep(5000);
//     // TODO https://github.com/mysqljs/mysql#connection-options
//     console.log("存证确权数据库释放中？");
//
//     await c1.connect(err =>console.log('存证确权数据库重连情况:', err));
// }, reconnectInterval);
setInterval(() => c1.ping(err => console.log('存证确权数据库连接情况:', err)), pulseInterval);
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function UseMysql_c1(req, res, handle, params=null) {
    if(c1.state != "authenticated") {
        console.log("存证确权数据库连接失败");
        res.send('存证确权数据库连接失败，请联系监测终端后台开发人员');
        res.end();
        return;
    }
    else{
        let resJson = null;
        if(params == null){
            resJson = await handle(extraData);
        }
        else{
            resJson = await handle(extraData, params);
        }
        res.send({'data': resJson});
        res.end();
    }

}
export const c2 = mysql.createConnection(mysqlConf2);

await c2.connect(err =>console.log('监测维权数据库连接情况:', err));

// setInterval(async function() {
//     c2.end();
//     await c2.connect(err =>console.log('监测维权数据库重连情况:', err));
// }, reconnectInterval);
setInterval(() => c2.ping(err => console.log('监测维权数据库连接情况:', err)), pulseInterval);


async function UseMysql_c2(req, res, handle, params=null) {
    if(c2.state != "authenticated") {
        console.log("监测维权数据库连接失败");
        res.send('监测维权数据库连接失败，请联系监测终端后台开发人员');
        res.end();
        return;
    }
    else{
        let resJson = null;
        if(params == null){
            resJson = await handle(req, res);
        }
        else{
            resJson = await handle(req, res, params);
        }
        res.send({'data': resJson});
        res.end();
    }

}
/*----------信息查询请求路由配置----------*/
const confirmRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});
const tokenRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});
const certificateRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});
const surveilanceRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});
const testRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});

// 不同作品类型存证的时间分布/季
confirmRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkTypeEXchange);
});
// localhost:9181/backend/certificateAmountGroupByWorkTypeEXchange

// 作品的时间分布/月
confirmRouter.get('/certificateAmountEXchange', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountEXchange);
});
// localhost:9181/backend/certificateAmountEXchange

// 不同作品类型的存证分布
confirmRouter.get('/certificateAmountGroupByWorkType', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkType);
});
// localhost:9181/backend/certificateAmountGroupByWorkType

// 不同著作权产生方式的存证分布
confirmRouter.get('/certificateAmountGroupByCreateType', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByCreateType);
});
// localhost:9181/backend/certificateAmountGroupByCreateType

// TODO 合作企业的存证分布
confirmRouter.get('/certificateAmountGroupByCooperator', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByCooperator);
});
// localhost:9181/backend/certificateAmountGroupByCooperator

// TODO 存证总数
confirmRouter.get('/certificateCount', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmount);
});
// localhost:9181/backend/certificateCount


/**************************/
/****       作品通证     ****/
/**************************/
// TODO 不同作品类型通证的时间分布/季
tokenRouter.get('/tokenAmountGroupByWorkTypeEXchange', async function(req, res) {
    await UseMysql_c1(req, res, tokenDisplayGroup.handleTokenAmountGroupByWorkTypeEXchange);
});
// localhost:9181/backend/token/tokenAmountGroupByWorkTypeEXchange

// TODO 通证的时间分布/月
tokenRouter.get('/tokenAmountEXchange', async function(req, res) {
    await UseMysql_c1(req, res, tokenDisplayGroup.handleTokenAmountEXchange);
});
// localhost:9181/backend/token/tokenAmountEXchange

// TODO 不同作品类型的通证分布
tokenRouter.get('/tokenAmountGroupByWorkType', async function(req, res) {
    await UseMysql_c1(req, res, tokenDisplayGroup.handleTokenAmountGroupByWorkType);
});
// localhost:9181/backend/token/tokenAmountGroupByWorkType

// TODO 不同著作权产生方式的通证分布
tokenRouter.get('/tokenAmountGroupByCreateType', async function(req, res) {
    await UseMysql_c1(req, res, tokenDisplayGroup.handleTokenAmountGroupByCreateType);
});
// localhost:9181/backend/token/tokenAmountGroupByCreateType

// TODO 合作企业的通证分布
tokenRouter.get('/tokenAmountGroupByCooperator', async function(req, res) {
    await UseMysql_c1(req, res, tokenDisplayGroup.handleTokenAmountGroupByCooperator);
});
// localhost:9181/backend/token/tokenAmountGroupByCooperator

// TODO 通证总数
tokenRouter.get('/tokenAmount', async function(req, res) {
    await UseMysql_c1(req, res, tokenDisplayGroup.handleTokenAmount);
});
// localhost:9181/backend/token/tokenAmount


/**************************/
/****    数字版权证书    ****/
/**************************/

// TODO 不同作品类型证书的时间分布/季
certificateRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    await UseMysql_c1(req, res, certificateDisplayGroup.handleCertificateAmountGroupByWorkTypeEXchange);
});
// localhost:9181/backend/certificate/certificateAmountGroupByWorkTypeEXchange

// TODO 证书的时间分布/月
certificateRouter.get('/certificateAmountEXchange', async function(req, res) {
    await UseMysql_c1(req, res, certificateDisplayGroup.handleCertificateAmountEXchange);
});
// localhost:9181/backend/certificate/certificateAmountEXchange

// 不同著作权类型的证书分布
certificateRouter.get('/certificateAmountGroupByCopyrightType', async function(req, res) {
    // await UseMysql_c1(req, res, certificateDisplayGroup.handleCopyRightAmountGroupByCopyrightType);
    await UseMysql_c1(req, res, certificateDisplayGroup.handleCertificateAmountGroupByCopyrightType);
});
// localhost:9181/backend/certificate/certificateAmountGroupByCopyrightType

// TODO 不同著作权产生方式的证书分布
certificateRouter.get('/certificateAmountGroupByCreateType', async function(req, res) {
    await UseMysql_c1(req, res, certificateDisplayGroup.handleCertificateAmountGroupByCreateType);
});
// localhost:9181/backend/certificate/certificateAmountGroupByCreateType

// TODO 合作企业的证书分布
certificateRouter.get('/certificateAmountGroupByCooperator', async function(req, res) {
    await UseMysql_c1(req, res, certificateDisplayGroup.handleCertificateAmountGroupByCooperator);
});
// localhost:9181/backend/certificate/certificateAmountGroupByCooperator

// TODO 证书总数
certificateRouter.get('/certificateAmount', async function(req, res) {
    await UseMysql_c1(req, res, certificateDisplayGroup.handleCertificateAmount);
});
// localhost:9181/backend/certificate/certificateAmount
/**************************/
/****       监测维权     ****/
/**************************/
surveilanceRouter.get('/TortCount', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCount);
});
// localhost:9181/backend/listen/TortCount

surveilanceRouter.get('/TortWorkCount', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortWorkCount);
});
// localhost:9181/backend/listen/TortWorkCount

surveilanceRouter.get('/PictureTortCountGroupByTortSite', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByTortSite, PICTURE_WORKTYPE);
});
// localhost:9181/backend/listen/PictureTortCountGroupByTortSite

surveilanceRouter.get('/MoiveTortCountGroupByTortSite', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByTortSite, MOVIE_WORKTYPE);
});
// localhost:9181/backend/listen/MoiveTortCountGroupByTortSite

surveilanceRouter.get('/MusicTortCountGroupByTortSite', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByTortSite, MUSIC_WORKTYPE);
});
// localhost:9181/backend/listen/MusicTortCountGroupByTortSite

surveilanceRouter.get('/TortCountPictureGroupByTortSiteEXchange', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByWorkTypeEXchange, PICTURE_WORKTYPE);
});
// localhost:9181/backend/listen/TortCountPictureGroupByTortSiteEXchange

surveilanceRouter.get('/TortCountMusicGroupByTortSiteEXchange', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByWorkTypeEXchange, MUSIC_WORKTYPE);
});
// localhost:9181/backend/listen/TortCountMusicGroupByTortSiteEXchange

surveilanceRouter.get('/Tort_AND_ClaimCountGroupByWorkType', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTort_AND_ClaimCountGroupByWorkType);
});
// localhost:9181/backend/listen/Tort_AND_ClaimCountGroupByWorkType

surveilanceRouter.get('/LatestAlarm', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleLatestAlarm);
});
// localhost:9181/backend/listen/LatestAlarm


testRouter.get('/generateTort', async function(req, res) {
    if(c2.state != "authenticated") {
        console.log("监测维权数据库连接失败");
        res.send('监测维权数据库连接失败，请联系监测终端后台开发人员');
        res.end();
        return;
    }
    else{
        let resInfo = await httpUtils.get("https://localhost:9181/backend1");
        console.log(resInfo);
        let sqlRight =util.format(
            "SELECT\n" +
            "\tToken.baseInfo_workId , Token.baseInfo_workType\n" +
            "FROM\n" +
            "\tToken\n" +
            "LIMIT 1000"
        );
        let resJson = await mysqlUtils.sql(c1, sqlRight);
        const RandomMaxRange = resJson.length>999?999:resJson.length;

        let workId = resJson[(localUtils.randomNumber(0,RandomMaxRange))]["baseInfo_workId"];
        let now = new Date(); //当前日期
        const nowTime = now.getTime();
        sqlRight =util.format(
            "INSERT INTO evidenceTable (workId, tortNum, tortSite, tortUrl, evidenceAddr, evidenceHash, saveTime, fixTime, workType)\n" +
            "                       VALUES\n" +
            "                       ( \"%s\", \"%s\",  \"网易云\", \"https://music.163.com/\",  \"%s\", \"%s\", \"%s\",  \"%s\", \"%s\")"
            ,workId, sha256(workId+nowTime.toString()), sha256(workId+1),sha256(sha256(workId+1)).toString().slice(0,45), nowTime/1000, nowTime/1000+1, 3);
        await mysqlUtils.sql(c2, sqlRight);
        console.log("time: ",nowTime)
        res.send({'data': nowTime});
        res.end();
    }

});
// localhost:9181/generateTort

testRouter.get('/HTTPTEST', async function (req, res) {
    let now = new Date(); //当前日期
    const nowTime = now.getTime();
    res.send({'data': nowTime});
    res.end();

})


// localhost:9181/HTTPTEST

/*----------http服务器配置----------*/

const app = express();
const port = 9181;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/backend1', async function (req, res) {
    // await sleep(15000);
    res.send("null");
    res.end();
})
app.post('/SYSCLOCK', async function (req, res) {
    let ReqTime = req.query.ReqTime;
    let estimateOffset = req.query.estimateOffset;

    let now = new Date().getTime();
    let OffsetDiff = (now - estimateOffset)-ReqTime;//多偏差出多少时间
    res.send({'OffsetDiff': OffsetDiff,
                    'recTime': now,});
    res.end();
})
// localhost:9181/SYSCLOCK

app.use(cors());
//app.js
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use('/', testRouter);
app.use('/backend', confirmRouter);
app.use('/backend/token', tokenRouter);
app.use('/backend/certificate', certificateRouter);
app.use('/backend/listen', surveilanceRouter);

/*----------启动http服务器----------*/

app.listen(port, () => console.log(`MidBackend listening on port ${port}!`));

