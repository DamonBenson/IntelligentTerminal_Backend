/**
 * @file: MimicAuthInsert.js
 * @Description: 确权存证相关的数据库插入
 * @author Bernard
 * @date 2022/9/13
 */
import mysql from 'mysql';
import sqlText from 'node-transform-mysql';

import * as mysqlUtils from '../utils/mysqlUtils.js';
import * as DateUtil from './DateUtil.js';
import * as localUtils from '../utils/localUtils.js';
import sha256 from 'crypto-js/sha256.js';

import {userAccount, userAccountIndex, mysqlConf, debugMode, WORKTYPE} from '../utils/info.js';
import util from 'util';

const c = mysql.createConnection(mysqlConf);
c.connect(); // mysql连接
await MimicAuthInsert();

async function MimicAuthInsert(){
        let sql = null;//待执行SQL语句
        // 发送上传请求至http服务器mainMid.js.
        let addr = userAccount[9+[localUtils.randomSelect(["用户1", "用户2"])]].address;

        // *平台存证请求* //
        // 平台                 提交给百度授权系统
        // 百度授权系统          存证链上链存证
        let workAuth = generateworkAuth();
        // 中间层监听链上消息（异步）存证链存证监听
        // let work = mimicChain1watchResponse(workAuth, addr);
        // 中间层               存证记录在数据库
        sql = sqlText.table('tort_info').data(workAuth).insert();
        await mysqlUtils.sql(c, sql);




        // 百度授权系统         交易链上链确权通证
        let workCopyRight = generateworkCopyRight(workAuth);
        // 中间层监听链上消息（异步）交易链确权监听
        // let copyRight = mimicChain2watchResponse(workCopyRight[0], addr);
        // 中间层               确权记录在数据库
        sql = sqlText.table('tort_info').data(workCopyRight).insert();
        await mysqlUtils.sql(c, sql);




        // TODO 平台许可请求
        let workAppr = generateworkAppr(workAuth, copyRight, addr);// 假设workAuth是交易的作品
        // 中间层               交易链上链许可通证
        let Appr = ApprFormat(workAppr);
        // 中间层               许可记录在数据库
        // ApprSave(Appr);
}
/*
 * @param null:
 * @return: null
 * @author: Bernard
 * @date: 2022/9/13 14:36
 * @description:生成一个合理的存证结果，该存折没有对应的作品 提交 假数据 绕过区块链直接填写到 假数据库 中
 * @example:.
 *
 */
export function generateworkAuth(){
    let workType = localUtils.randomSelect([1, 2, 3],[0.36,0.61,0.03]);// 1-14文字,口述,音乐,戏剧,曲艺,舞蹈,杂技艺术,美术,建筑,摄影,电影和类似摄制电影方法创作的作品,图形,模型,其他
    let copyrightCreateType = localUtils.randomSelect([1, 2, 3],[0.36,0.61,0.03]);//0-个人1-合作2-法人3-职务4-委托

    // let publishStatus = "Unpublished";//localUtils.randomSelect(["Unpublished","Published"])
    // let publishedDay = DateUtil.getBetweenDay(createdDay);
    let now = Date();//当前时间戳
    let workAuth = {};//模拟的存证数据
    let createdDay = DateUtil.getPastDay();
    workAuth = {
        baseInfo_timestamp:now,
        baseInfo_workType: workType,
        baseInfo_workName: sha256(localUtils.randomNumber(100, 2000000000).toString()).toString().substring(0,8),
        baseInfo_copyrightCreateType:localUtils.randomNumber(2,4),
        fileInfo_fileHash:sha256(localUtils.randomNumber(100, 2000000000).toString()).toString(),
        fileInfo_fileType:localUtils.randomNumber(2,4),// 文本(1)、图片(2)、音频(3)、视频(4)
        extraInfo_createType:localUtils.randomNumber(1,8),// 1-7原创，改编，翻译，汇编，注释，整理，其他
        extraInfo_createDate:createdDay.format("YYYYMMDD"),// 创作/制作完成时间
        extraInfo_createCity:130200,
        extraInfo_createCountry:0,
    };
    workAuth.baseInfo_workId = sha256(workAuth);

    if(debugMode) {
        console.log('workAuth:', workAuth);
    }
    else {
        console.log('workAuth.baseInfo_workId:', workAuth.baseInfo_workId);
    }
    return workAuth

}
function mimicChain1watchResponse(workAuth, addr){
    let now = Date();
    let published_time = 0;
    let published_site = null;
    let publishStatus = 0;
    if(workAuth.publishStatus == "Published"){
        publishStatus = 1;
        published_time = workAuth.publishInfo.publishedTime;
        published_site = workAuth.publishInfo.publishedSite;
    }
    let work={
        baseInfo_workId : sha256(workAuth.workName),
        baseInfo_timestamp : now,//
        baseInfo_address : addr,//
        work_name : workAuth.workName,
        work_type : workAuth.workType,
        file_info_list : workAuth.fileInfoList,//JSON.stringify(
        creation_type : workAuth.WorkType,
        created_time : workAuth.createdTime,
        created_place : workAuth.created_place,
        publish_status : workAuth.publishStatus,
        published_time : published_time,
        published_site : published_site
    }
    return work;
}
/*
 * @param null:
 * @return: null
 * @author: Bernard
 * @date: 2021/5/17 14:37
 * @description:收到存证结果对应颁发13个通证，为了展示需求，7广播,8信息网络传播权,9摄制权,10改编权,11翻译权,12汇编权,13其他
 * 部分不会颁布
 * @example:.
 *
 */
export function generateworkCopyRight(workAuth){

    // if(publishStatus == "Published"){
    //
    //         publishStatus:publishStatus,//发表状态，取值为Unpublished [未发表]，或者为Published (publishInfo)
    //         publishInfo:{
    //             publishedTime:publishedDay.format("YYYYMMDD"),
    //             publishedSite:'http://yjxt.bupt.edu.cn/Gstudent'
    //         }
    //
    //
    // }
    // else{
    //     workAuth = {
    //         workName: sha256(localUtils.randomNumber(100, 2000000000).toString()).toString().substring(0,8),
    //         workType: workType,// 文字,口述,音乐,戏剧,曲艺,舞蹈,杂技艺术,美术,建筑,摄影,电影和类似摄制电影方法创作的作品,图形,模型,其他
    //         fileInfoList:upload_fileInfoList,
    //         WorkType:localUtils.randomNumber(1,8),// 原创，改编，翻译，汇编，注释，整理，其他
    //         createdTime:createdDay.format("YYYYMMDD"),// 创作/制作完成时间
    //         createdPlace:"BUPT",
    //         publishStatus:publishStatus,//发表状态，取值为Unpublished [未发表]，或者为Published (publishInfo)
    //
    //     };
    // }
    let workCopyRight = [];
    let Name = sha256(localUtils.randomNumber(100, 2000000000).toString()).toString().substring(0,4);
    let IDType = localUtils.randomSelect([1,4,5,6],[0.4,0.2,0.1,0.3]);//居民身份证、军官证、营业执照、护照、企业法人营业执照、组织机构代码证书、事业单位法人证书、社团法人证书、其他有效证件
    let idNumHash = sha256(localUtils.randomNumber(100, 2000000000).toString()).toString();// 18位身份证
    for(let i = 1;i<=13;i++)
    {
        if(i>=7)//广播权开始//部分不会颁布
            if(localUtils.randomSelect([0,1])==1)
                continue;
        let SingleCopyRight = {
            copyrightType : i,
            name : Name,
            idType : IDType,
            idNumHash : idNumHash,
            nation : "中国",
            province : "北京",
            city : "北京",
            workSig : Name
        }
        workCopyRight.push(SingleCopyRight);
    }
    if(debugMode) {
        console.log('workCopyRight:', workCopyRight);
    }
    else {
        console.log('workCopyRight:', workCopyRight[0]);
    }
    return workCopyRight;
}
function mimicChain2watchResponse(SingleCopyRight , addr){
    let now = Math.round((new Date())/ 1000);
    let copyrightHolder = SingleCopyRight.copyrightHolder;
    if(debugMode) {
        console.log('SingleCopyRight:', SingleCopyRight);
    }
    else {
        console.log('SingleCopyRight:', copyrightHolder);
    }
    let copyRight = {
        TokenId : sha256(localUtils.randomNumber(100, 2000000000).toString()).toString(),
        timestamp : now,//
        address : addr,//
        workId : null,//
        copyright_right : SingleCopyRight.copyrightType,
        name : copyrightHolder.name,
        id_type : copyrightHolder.idType,
        id_num : copyrightHolder.idNumHash,
        nation : copyrightHolder.nation,
        province : copyrightHolder.province,
        city : copyrightHolder.city,
        work_sig : copyrightHolder.name
    }
    return copyRight;
}

// TODO 许可通证生成
export function generateworkAppr(workAuth, copyRight, addr){

    let now = Math.round((new Date())/ 1000);
    let workAppr = {
        approveId : sha256(localUtils.randomNumber(100, 2000000000).toString()).toString(),
        timestamp : now,
        startTime : copyRight.timestamp,
        baseInfo_timestamp : addr,
        copyrightId : copyRight.TokenId,
        copyrightType : copyRight.id_type,
        approveChannel : localUtils.randomSelect([0, 1, 2, 3, 4]),//0-Network;1-FullChannel;2-ProductLaunch;3-TV;4- NetworkMovie
        approveArea : localUtils.randomSelect([0, 1, 2]),//0-China;1-Asia;2-World
        approveTime : localUtils.randomSelect([0, 1, 2, 3])//0-HalfYear;1-OneYear;2-ThreeYear;3- Permanent
    }
    if(debugMode) {
        console.log('workAppr:', workAppr);
    }
    else {
        console.log('workAppr:', workAppr.approveId);
    }
    return workAppr;


}

function ApprFormat(workAppr) {
    let Appr ={
        approve_id : workAppr.approveId,
        address : workAppr.address,
        start_time : workAppr.startTime,
        timestamp : workAppr.timestamp,
        TokenId : workAppr.copyrightId,
        copyright_type : workAppr.copyrightType,
        approve_channel : workAppr.approveChannel,
        approve_area : workAppr.approveArea,
        approve_time : workAppr.approveTime
    }

    return Appr;

}