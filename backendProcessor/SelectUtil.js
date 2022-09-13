import util from "util";
import * as mysqlUtils from "../utils/mysqlUtils.js";
import {c} from "../MidBackend.js";
import {WORKTYPE} from "../utils/info.js";

/**
 * @file: SelectUtil.js
 * @param table:选择表
 * @param byKey:选择的键
 * @param_default limit:前limit个分类
 * @Description: 按日期查询；单字段分组查询；多字段分组查询
 * @author Bernard
 * @date 2021/5/31
 */
export async function countGroupBy(table, byKey, endTimeStamp = null,startTimeStamp = null,
                                   timeName = "completion_time", limit = 3){
    let sqlRight = _sqlGroupBy(table, byKey , endTimeStamp , startTimeStamp ,timeName, limit);
    let sqlRes = await mysqlUtils.sql(c, sqlRight);
    let Res = {};
    sqlRes.forEach(value =>
        Res[[value[byKey]]] = value['num']
    );
    return Res;
}

function _sqlGroupBy(table, byKey , endTimeStamp , startTimeStamp , timeName, limit) {
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
        '\t) AS Type\n' +
        'ORDER BY\n' +
        '\tnum DESC\n' +
        'LIMIT %d',
        table, byKey,
        limit);
    return sqlRight;
}
/*
 * @param null:
 * @return: null
 * @author: Bernard
 * @date: 2021/6/18 13:19
 * @description:
 * @example:.
 *
 */
export async function countNum(table, key="work_id", endTimeStamp = null,startTimeStamp = null) {
    let sqlRight = _sqlNum(table, key, endTimeStamp,startTimeStamp);
    let sqlRes = await mysqlUtils.sql(c, sqlRight);
    return _getAnum_from_Res(sqlRes);
}
export async function countNumJoinRight(table, key, joinTable, joinKey, endTimeStamp = null,startTimeStamp = null) {
    let sqlRight = _sqlNum(table, key, endTimeStamp, startTimeStamp,joinTable, joinKey,true,true);
    let sqlRes = await mysqlUtils.sql(c, sqlRight);
    return _getAnum_from_Res(sqlRes);

}
export async function countNumJoinRightAll(table, key, joinTable, joinKey, endTimeStamp = null,startTimeStamp = null) {
    let sqlRight = _sqlNum(table, key, endTimeStamp, startTimeStamp,joinTable, joinKey,true,false);
    let sqlRes = await mysqlUtils.sql(c, sqlRight);
    return _getAnum_from_Res(sqlRes);

}
function _getAnum_from_Res(sqlRes) {
    let Res = {};
    sqlRes.forEach(value =>
        Res['num'] = value['num']
    );
    return Res;
}
function _sqlNum(table, key, endTimeStamp, startTimeStamp, joinTable=null, joinKey=null, inner_join = false, right = false) {
    let sqlRight =util.format(
        'SELECT DISTINCT\n' +
        '\tCOUNT(%s.%s) AS num\n' +
        'FROM\n' +
        '\t%s\n' ,
        table,key,
        table);
    if(inner_join){
        sqlRight = sqlRight+util.format(
            '\tINNER JOIN\n' +
            '\t(\n' +
            '\t\t%s\n' +
            '\t)\n' +
            '\tON \n' +
            '\t\t%s.%s = %s.%s\n',
            joinTable,
            table,joinKey,joinTable,joinKey);
    }
    if(endTimeStamp != null){
        sqlRight = sqlRight+util.format(
            '\t\tWHERE\n' +
            '\t\t\twork_info.completion_time <= %s AND\n' +
            '\t\t\twork_info.completion_time > %s\n',
            endTimeStamp,startTimeStamp);
        if(right==true){//确权
            sqlRight = sqlRight+'\tAND right_token_info.copyright_type = 1 \n';
        }
    }
    return sqlRight;
}