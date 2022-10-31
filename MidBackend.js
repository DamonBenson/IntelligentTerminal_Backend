import express from 'express';
import bodyParser from 'body-parser';
import * as authDisplayGroup from './backendProcessor/authDisplayGroup.js';
import * as listenDisplayGroup from './backendProcessor/listenDisplayGroup.js';
import * as httpUtils from './utils/httpUtils.js';
import mysql from 'mysql';

import {MOVIE_WORKTYPE, MUSIC_WORKTYPE, mysqlConf1, PICTURE_WORKTYPE} from './utils/info.js';
import {mysqlConf2} from './utils/info.js';
import fs from "fs";
export const c1 = mysql.createConnection(mysqlConf1);
const reconnectInterval = 5000;//5s60*60000;//1h
const pulseInterval = 60000;//1min
const updateExtraDataeInterval = 5000;//5s

const debugMode = false;
const SAVEPATH = './ExtraData'

//  更新版权局数据
async function updateExtraData(savePath = SAVEPATH) {
    const url = 'http://117.107.213.242:8151/by/queryStatisticsData';
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

// handleDisconnect(c1);
//
//
// function handleDisconnect(connection) {
//     //监听错误事件
//     connection.on('error', function(err) {
//         if (!err.fatal) {
//             return;
//         }
//
//         if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
//             throw err;
//         }
//
//         console.log('Re-connecting lost connection: ' + err.stack);
//
//         connection = mysql.createConnection(connection.config);
//         handleDisconnect(connection);
//         connection.connect();
//     });
// }



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
const authRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});

const listenRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});

const testRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});

// 新增存证数量/月
authRouter.get('/certificateAmountEXchange', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountEXchange);
});
// localhost:9181/backend/certificateAmountEXchange

// 不同作品类型的存证分布分布
authRouter.get('/certificateAmountGroupByWorkType', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkType);
});
// localhost:9181/backend/certificateAmountGroupByWorkType

// 新增不同作品类型的存证数量/季
authRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkTypeEXchange);
});
// localhost:9181/backend/certificateAmountGroupByWorkTypeEXchange

// 新增版权通证数量/月
authRouter.get('/copyRightAmountEXchange', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCopyRightAmountEXchange);
});
// localhost:9181/backend/copyRightAmountEXchange

// 不同著作权产生方式的存证分布
authRouter.get('/certificateAmountGroupByCreateType', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCertificateAmountGroupByCreateType);
});
// localhost:9181/backend/certificateAmountGroupByCreateType

// 不同类别通证数量分布
authRouter.get('/copyRightAmountGroupByCopyrightType', async function(req, res) {
    await UseMysql_c1(req, res, authDisplayGroup.handleCopyRightAmountGroupByCopyrightType);
});
// localhost:9181/backend/copyRightAmountGroupByCopyrightType


/**************************/
/****       监测维权     ****/
/**************************/
listenRouter.get('/TortCount', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCount);
});
// localhost:9181/backend/listen/TortCount

listenRouter.get('/TortWorkCount', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortWorkCount);
});
// localhost:9181/backend/listen/TortWorkCount

listenRouter.get('/PictureTortCountGroupByTortSite', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByTortSite, PICTURE_WORKTYPE);
});
// localhost:9181/backend/listen/PictureTortCountGroupByTortSite

listenRouter.get('/MoiveTortCountGroupByTortSite', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByTortSite, MOVIE_WORKTYPE);
});
// localhost:9181/backend/listen/MoiveTortCountGroupByTortSite

listenRouter.get('/MusicTortCountGroupByTortSite', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByTortSite, MUSIC_WORKTYPE);
});
// localhost:9181/backend/listen/MusicTortCountGroupByTortSite

listenRouter.get('/TortCountPictureGroupByTortSiteEXchange', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByWorkTypeEXchange, PICTURE_WORKTYPE);
});
// localhost:9181/backend/listen/TortCountPictureGroupByTortSiteEXchange

listenRouter.get('/TortCountMusicGroupByTortSiteEXchange', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTortCountGroupByWorkTypeEXchange, MUSIC_WORKTYPE);
});
// localhost:9181/backend/listen/TortCountMusicGroupByTortSiteEXchange

listenRouter.get('/Tort_AND_ClaimCountGroupByWorkType', async function(req, res) {
    await UseMysql_c2(req, res, listenDisplayGroup.handleTort_AND_ClaimCountGroupByWorkType);
});
// localhost:9181/backend/listen/Tort_AND_ClaimCountGroupByWorkType


testRouter.get('/generateTort', async function(req, res) {
    let now = new Date(); //当前日期
    res.send({'data': now.getTime()});
    res.end();
});
// localhost:9181/generateTort

/*----------http服务器配置----------*/

const app = express();
const port = 9181;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.get('/backend1', function (req, res) {
    res.send('Hello World');
 })
//app.js
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

app.use('/', testRouter);
app.use('/backend', authRouter);
app.use('/backend/listen', listenRouter);


/*----------启动http服务器----------*/

app.listen(port, () => console.log(`MidBackend listening on port ${port}!`));

