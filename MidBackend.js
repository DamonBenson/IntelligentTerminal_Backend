import express from 'express';
import bodyParser from 'body-parser';
import * as authDisplayGroup from './backendProcessor/authDisplayGroup.js';
import * as listenDisplayGroup from './backendProcessor/listenDisplayGroup.js';
import mysql from 'mysql';

import {mysqlConf} from './utils/info.js';
export const c = mysql.createConnection(mysqlConf);
await c.connect();
const reconnectInterval = 60*60000;//1h
const pulseInterval = 60000;//1min

setInterval(async function() {
    c.end();
    await c.connect();
}, reconnectInterval);
setInterval(() => c.ping(err => console.log('MySQL ping err:', err)), pulseInterval);


/*----------信息查询请求路由配置----------*/
async function UseMysql(req, res, handle) {

    try{
        await c.connect();
    }
    catch(e){
        console.log("Connect Release?");
        res.send('数据库错误，请联系监测终端后台开发人员');
        res.end();
        c.end();
        return;
    }

    let resJson = await handle(req, res);
    res.send({'data': resJson});
    res.end();
    c.end();
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
// // localhost:9002/backend/authRightRate
// authRouter.get('/authByCompany', async function(req, res) {
//     await NoUseMysql(req, res, authDisplayGroup.handleAuthByCompany);
// });
// // localhost:9002/backend/authByCompany

authRouter.get('/certificateAmountEXchange', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountEXchange);
});
// localhost:9002/backend/certificateAmountEXchange

authRouter.get('/certificateAmountGroupByWorkType', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkType);
});
// localhost:9002/backend/certificateAmountGroupByWorkType

authRouter.get('/certificateAmountGroupByWorkTypeEXchange', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCertificateAmountGroupByWorkTypeEXchange);
});
// localhost:9002/backend/certificateAmountGroupByWorkTypeEXchange

authRouter.get('/copyRightAmountEXchange', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCopyRightAmountEXchange);
});
// localhost:9002/backend/copyRightAmountEXchange

authRouter.get('/copyRightAmountGroupByIDtype', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCopyRightAmountGroupByIDtype);
});
// localhost:9002/backend/copyRightAmountGroupByIDtype

authRouter.get('/copyRightAmountGroupByCopyrightType', async function(req, res) {
    await NoUseMysql(req, res, authDisplayGroup.handleCopyRightAmountGroupByCopyrightType);
});
// localhost:9002/backend/copyRightAmountGroupByCopyrightType


/**************************/
/****       监测维权     ****/
/**************************/
listenRouter.get('/TortCount', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCount);
});
// localhost:9002/backend/listen/TortCount

listenRouter.get('/TortClickCount', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortClickCount);
});
// localhost:9002/backend/listen/TortClickCount

listenRouter.get('/TortCountEXchange', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountEXchange);
});
// localhost:9002/backend/listen/TortCountEXchange

listenRouter.get('/TortCountGroupByWorkType', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByWorkType);
});
// localhost:9002/backend/listen/TortCountGroupByWorkType

listenRouter.get('/TortCountGroupByCreationType', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByCreationType);
});
// localhost:9002/backend/listen/TortCountGroupByCreationType

listenRouter.get('/TortCountGroupByWorkTypeEXchange', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByWorkTypeEXchange);
});
// localhost:9002/backend/listen/TortCountGroupByWorkTypeEXchange

listenRouter.get('/TortCountGroupByCreationTypeEXchange', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByCreationTypeEXchange);
});
// localhost:9002/backend/listen/TortCountGroupByCreationTypeEXchange

listenRouter.get('/TortCountGroupByTortSite', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByTortSite);
});
// localhost:9002/backend/listen/TortCountGroupByTortSite

listenRouter.get('/TortCountGroupByTortSiteEXchange', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByTortSiteEXchange);
});
// localhost:9002/backend/listen/TortCountGroupByTortSiteEXchange

listenRouter.get('/TortCountGroupByTortSiteGroupByWorkType', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTortCountGroupByTortSiteGroupByWorkType);
});
// localhost:9002/backend/listen/TortCountGroupByTortSiteGroupByWorkType

listenRouter.get('/Tort_AND_ClaimCountGroupByWorkType', async function(req, res) {
    await NoUseMysql(req, res, listenDisplayGroup.handleTort_AND_ClaimCountGroupByWorkType);
});
// localhost:9002/backend/listen/Tort_AND_ClaimCountGroupByWorkType


/*----------http服务器配置----------*/

const app = express();
const port = 9002;

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

