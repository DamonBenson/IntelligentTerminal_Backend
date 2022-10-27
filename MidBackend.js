import express from 'express';
import bodyParser from 'body-parser';
import * as authDisplayGroup from './backendProcessor/authDisplayGroup.js';
import * as listenDisplayGroup from './backendProcessor/listenDisplayGroup.js';
import request from 'request'
import * as httpUtils from './utils/httpUtils.js';
import mysql from 'mysql';

import {MOVIE_WORKTYPE, MUSIC_WORKTYPE, mysqlConf1, PICTURE_WORKTYPE} from './utils/info.js';
import {mysqlConf2} from './utils/info.js';
export const c1 = mysql.createConnection(mysqlConf1);
await c1.connect();
const reconnectInterval = 60*60000;//1h
const pulseInterval = 60000;//1min
const debugMode = 1;

//  更新版权局数据
function updateExtraData(){
    const url='http://117.107.213.242:8151/by/queryStatisticsData';
    const param={date: null};
    let resInfo = httpUtils.postFormData(url, param);
    console.log('北版数据:', resInfo);
}




await c1.connect(err =>console.log('存证确权数据库连接失败:', err));
setInterval(async function() {
    c1.end();
    await c1.connect();
}, reconnectInterval);
setInterval(() => c1.ping(err => console.log('MySQL ping err:', err)), pulseInterval);


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
            resJson = await handle(req, res);
        }
        else{
            resJson = await handle(req, res, params);
        }
        res.send({'data': resJson});
        res.end();
    }

}
export const c2 = mysql.createConnection(mysqlConf2);

await c2.connect(err =>console.log('监测维权数据库连接失败:', err));

setInterval(async function() {
    c2.end();
    await c2.connect();
}, reconnectInterval);
setInterval(() => c2.ping(err => console.log('MySQL ping err:', err)), pulseInterval);


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
// async function WithMysql(req, res, handle, params=null) {
//     let resJson = null;
//     if(params == null){
//         resJson = await handle(req, res);
//     }
//     else{
//         resJson = await handle(req, res, params);
//     }
//     res.send({'data': resJson});
//     res.end();
// }
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

// 当前不同作品类型存证数量分布
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

