import express from 'express';
import bodyParser from 'body-parser';
import * as authDisplayGroup from './backendProcessor/authDisplayGroup.js';
import * as listenDisplayGroup from './backendProcessor/listenDisplayGroup.js';
import mysql from 'mysql';

import {mysqlConf1} from './utils/info.js';
export const c1 = mysql.createConnection(mysqlConf1);
await c1.connect();
const reconnectInterval = 60*60000;//1h
const pulseInterval = 60000;//1min

setInterval(async function() {
    c1.end();
    await c1.connect();
}, reconnectInterval);
setInterval(() => c1.ping(err => console.log('MySQL ping err:', err)), pulseInterval);


/*----------信息查询请求路由配置----------*/
async function UseMysql(req, res, handle) {

    try{
        await c1.connect();
    }
    catch(e){
        console.log("Connect Release?");
        res.send('数据库错误，请联系监测终端后台开发人员');
        res.end();
        c1.end();
        return;
    }

    let resJson = await handle(req, res);
    res.send({'data': resJson});
    res.end();
    c1.end();
}
import {mysqlConf2} from './utils/info.js';
export const c2 = mysql.createConnection(mysqlConf2);
await c2.connect();

setInterval(async function() {
    c2.end();
    await c2.connect();
}, reconnectInterval);
setInterval(() => c2.ping(err => console.log('MySQL ping err:', err)), pulseInterval);


/*----------信息查询请求路由配置----------*/
async function UseMysql_c2(req, res, handle) {

    try{
        await c2.connect();
    }
    catch(e){
        console.log("Connect Release?");
        res.send('数据库错误，请联系监测终端后台开发人员');
        res.end();
        c2.end();
        return;
    }

    let resJson = await handle(req, res);
    res.send({'data': resJson});
    res.end();
    c2.end();
}
/*----------信息查询请求路由配置----------*/
async function NoUseMysql(req, res, handle) {
    let resJson = await handle(req, res);
    res.send({'data': resJson});
    res.end();
}
const authRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});

const listenRouter = express.Router({
    caseSensitive: false,// 不区分大小写
});
// authRouter.get('/authRightRate', async function(req, res) {
//     await NoUseMysql(req, res, authDisplayGroup.handleAuthRightRate);
// });
// // localhost:9181/backend/authRightRate
// authRouter.get('/authByCompany', async function(req, res) {
//     await NoUseMysql(req, res, authDisplayGroup.handleAuthByCompany);
// });
// // localhost:9181/backend/authByCompany

// 新增存证数量/月
authRouter.get('/certificateAmountEXchange', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountEXchange);
});
// localhost:9181/backend/certificateAmountEXchange

// 当前不同作品类型存证数量分布
authRouter.get('/certificateAmountGroupByWorkType', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkType);
});
// localhost:9181/backend/certificateAmountGroupByWorkType

// 新增不同作品类型的存证数量/季
authRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkTypeEXchange);
});
// localhost:9181/backend/certificateAmountGroupByWorkTypeEXchange

// 新增版权通证数量/月
authRouter.get('/copyRightAmountEXchange', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCopyRightAmountEXchange);
});
// localhost:9181/backend/copyRightAmountEXchange

// 不同著作权产生方式的存证分布
authRouter.get('/certificateAmountGroupByCreateType', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountGroupByCreateType);
});
// localhost:9181/backend/certificateAmountGroupByCreateType

// 不同类别通证数量分布
authRouter.get('/copyRightAmountGroupByCopyrightType', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCopyRightAmountGroupByCopyrightType);
});
// localhost:9181/backend/copyRightAmountGroupByCopyrightType


/**************************/
/****       监测维权     ****/
/**************************/
listenRouter.get('/TortCount', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCount);
});
// localhost:9181/backend/listen/TortCount

listenRouter.get('/TortWorkCount', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortWorkCount);
});
// localhost:9181/backend/listen/TortWorkCount

listenRouter.get('/TortCountGroupByTortSite', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByTortSite);
});
// localhost:9181/backend/listen/TortCountGroupByTortSite

listenRouter.get('/TortCountGroupByWorkTypeEXchange', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByWorkTypeEXchange);
});
// TODO localhost:9181/backend/listen/TortCountGroupByWorkTypeEXchange

listenRouter.get('/Tort_AND_ClaimCountGroupByWorkType', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTort_AND_ClaimCountGroupByWorkType);
});
// localhost:9181/backend/listen/Tort_AND_ClaimCountGroupByWorkType

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
app.use('/backend', authRouter);
app.use('/backend/listen', listenRouter);


/*----------启动http服务器----------*/

app.listen(port, () => console.log(`MidBackend listening on port ${port}!`));

