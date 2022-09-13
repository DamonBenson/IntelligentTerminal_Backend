/**
 * @file: MimicTortInsert.js
 * @Description: 监测维权相关的数据库插入
 * @author Bernard
 * @date 2021/5/31
*/
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../utils/localUtils.js';
import sha256 from 'crypto-js/sha256.js';

import {
    userAccount,
    userAccountIndex,
    debugMode,
    WORKTYPE,TORTURL,TORTSITE,
    mysqlConf
} from '../utils/info.js';
import util from 'util';
import {sleep} from "../utils/localUtils.js";
const c = mysql.createConnection(mysqlConf);
await c.connect();
await MimicTortInsert();
async function MimicTortInsert() {
    while (true){
        let now = new Date(); //当前日期
        let Res = await generateTort();
        let tortSite = localUtils.randomSelect([1,2,3,4,5],[0.5,0.2,0.15,0.1,0.05])
        let work_id = Res[0]["work_id"];//被侵权的作品
        let tortInfo = {
            sample_Id : sha256(localUtils.randomNumber(100, 2000000000).toString()).toString(),
            tort_num : localUtils.randomNumber(1, 300000),
            upload_time : now.getTime()/1000, //时间戳
            monitor_time : now.getTime()/1000, //时间戳
            tort_url : TORTURL[tortSite],
            work_id : work_id,
            tort_title : sha256(localUtils.randomNumber(100, 2000000000).toString()).toString().substring(0,8),
            site_name : TORTSITE[tortSite],
            author : sha256(localUtils.randomNumber(100, 2000000000).toString()).toString().substring(0,8),
            pub_time : now.getTime()/1000,
            click_count : localUtils.randomNumber(100, 200000),
            duration : localUtils.randomNumber(15, 2000)
        }
        console.log('tortInfo:', tortInfo);
        let sql = sqlText.table('tort_info').data(tortInfo).insert();
        await mysqlUtils.sql(c, sql);
        // await sleep(2000);
    }
}
/*
 * @param null:
 * @return: null
 * @author: Bernard
 * @date: 2021/5/17 14:36
 * @description:生成一个侵权结果
 * @example:.
 *
 */
export async function generateTort() {
    let offset = localUtils.randomNumber(1, 7800);
    let sql = sqlText.table('work_info').limit(offset, 1).field(['work_id']).select()
    let Res = await mysqlUtils.sql(c, sql);
    return Res;
}
