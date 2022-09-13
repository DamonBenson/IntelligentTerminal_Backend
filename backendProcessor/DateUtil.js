import util from "util";
import moment from "moment";
import * as localUtils from '../utils/localUtils.js';

// LearnAboutDateUtil();
// let now = new Date(); //当前日期
// console.log(now.getTime());

// console.log(getMonthTimeStampMap());
// console.log(getMonthTimeStampArray());
// console.log(transMonthName(new Date()));
export function LearnAboutDateUtil(){
    let timeToday = Math.round((new Date())/ 1000);
    let timeNow = new Date();
    console.log("timeToday：",timeToday);
    console.log("timeToday：",timeNow.getDate());
    let now = new Date(); //当前日期
    let nowDay = now.getDate();
    let nowMonth = now.getMonth(); //当前月 
    let nowYear = now.getFullYear(); //当前年
    let nowMoment = moment(now);
    console.log("getTime",now.getTime());
    console.log("getUTCDate",now.getUTCDate());
    console.log("getDay",now.getDay());
    console.log("toUTCString",now.toUTCString());
    console.log("getStandardDate",getStandardDate(nowYear,nowMonth,nowDay));
    let index = 30;
    while(index > 0){
        index --;
        let offset = localUtils.randomNumber(1,60*60*24*30*12);
        let tempMonent = nowMoment.clone();
        let thatMoment = nowMoment.subtract(offset, 'seconds');
        nowMoment = tempMonent;
        console.log("thatMoment",thatMoment.format("YYYYMMDD"));
        console.log("nowMoment",nowMoment.format("YYYYMMDD"));
    }
    index = 30;
    while(index > 0){
        index --;
        console.log("PastDay:",getPastDay());
    }
    //本月的开始时间
    let monthStartDate = new Date(nowYear, nowMonth-1); 
    //本月的结束时间
    let monthEndDate = new Date(nowYear, nowMonth+1, 0);
    let timeStart=Date.parse(monthStartDate)/1000;//s
    let timeEnd=Date.parse(monthEndDate)/1000;//s
    console.log("now",now);
    console.log("nowMonth",nowMonth);
    console.log("nowYear",nowYear);
    console.log("monthStartDate",monthStartDate);
    console.log("monthEndDate",monthEndDate);
    console.log("timeStart",timeStart);
    console.log("timeEnd",timeEnd);
    for (let index = 0; index < 14; index++) {
        let time = new Date(nowYear, index); 
    
        console.log("time",time,"Month",index);
    
    }
    console.log("now",now);
}
/*
 * @param Day: 指定倒回的天数
 * @return: PastDay need add format("YYYYMMDD")
 * @author: Bernard
 * @date: 2021/5/17 15:07
 * @description:
 * @example:.
 * 
 */
export function getPastDay(Day = null){
    let now = new moment(); //当前日期
    if( Day == null ){
        let offset = localUtils.randomNumber(1,60*60*24*30*12);//一年前
        now.subtract(offset, 'seconds');
    }
    else{
        now.subtract(Day, 'days');
    }
    return now;
}
/*
 * @param DayStart:
 * @param DayEnd: default now
 * @return: BetweenDay need add format("YYYYMMDD")
 * @author: Bernard
 * @date: 2021/5/17 15:22
 * @description:
 * @example:let now = new moment(); //当前日期20210517
 * now.subtract(1,'days')20210516
 * console.log(getBetweenDay(now));
 * 20210516
 */
export function getBetweenDay(DayStart, DayEnd = null){
    if( DayEnd == null ){
        DayEnd = new moment(); //当前日期
    }
    let IntervalDay = DayEnd.diff(DayStart, 'days');//差距天数
    let offset = localUtils.randomNumber(1,IntervalDay);
    DayEnd.subtract(offset)
    return DayEnd;
}


export function getStandardDate(Year, Month, Day){
    return util.format(
        '%s%s%s',Year,Month,Day);
}

/*
 * @param MonthsAmong:
 * @param MonthOrWeek:
 * @return: TimeStampMap:逆序字典
 * @author: Bernard
 * @date: 2021/5/16 20:44
 * @description:默认返回12个月的时间戳
 * {
  '0': 1621169716,
  '1': 1619798400,
  '2': 1617206400,
  '3': 1614528000,
  '4': 1612108800,
  '5': 1609430400,
  '6': 1606752000,
  '7': 1604160000,
  '8': 1601481600,
  '9': 1598889600,
  '10': 1596211200,
  '11': 1593532800,
  '12': 1590940800}
 */
export function getMonthTimeStampMap(MonthsAmong = 12,MonthOrWeek = true){
    let TimeStampMap = {};
    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
                        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"}
    let now = new Date(); //当前日期 
    
    
    let nowMonth = now.getMonth(); //当前月 
    let nowYear = now.getFullYear(); //当前年 
    TimeStampMap[0] = Date.parse(now)/1000;

    for (let index = 0; index < MonthsAmong; index++) {
        let time = new Date(nowYear, nowMonth - index); 
        let timeStart = Date.parse(time)/1000;//s
        /* example:
        * console.log("time",time,"Month",index,"timeStart",timeStart,"time.getMonth",time.getMonth());
        * time 2021-04-30T16:00:00.000Z Month 0 timeStart 1619798400 time.getMonth 4
        */
        TimeStampMap[index+1] = timeStart;
    }
    return TimeStampMap;
}
/*
 * @param MonthsAmong:
 * @param MonthOrWeek:
 * @return: [TimeStampArray, MonthArray]:逆序时间列表，逆序中文列表
 * @author: Bernard
 * @date: 2021/5/16 20:49
 * @description:
 * [[
        1621169716, 1619798400,
        1617206400, 1614528000,
        1612108800, 1609430400,
        1606752000, 1604160000,
        1601481600, 1598889600,
        1596211200, 1593532800,
        1590940800
      ],
      [
        '五月',   '五月',
        '四月',   '三月',
        '二月',   '一月',
        '十二月', '十一月',
        '十月',   '九月',
        '八月',   '七月',
        '六月'
      ]]
 *
 */
export function getMonthTimeStampArray(MonthsAmong = 12,MonthOrWeek = true){
    let TimeStampArray = [];
    let MonthArray = [];

    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
                        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"}
    let now = new Date(); //当前日期 
    let nowMonth = now.getMonth(); //当前月 
    let nowYear = now.getFullYear(); //当前年 
    MonthArray.push(transMonthName(now));
    TimeStampArray.push(Date.parse(now)/1000);
    for (let index = 0; index < MonthsAmong; index++) {
        let time = new Date(nowYear, nowMonth - index); 
        let timeStart = Date.parse(time)/1000;//s
        MonthArray.push(transMonthName(time));
        TimeStampArray.push(timeStart);
        /* example:
        * console.log("time",time,"Month",index,"timeStart",timeStart,"time.getMonth",time.getMonth());
        * time 2021-04-30T16:00:00.000Z Month 0 timeStart 1619798400 time.getMonth 4
        */
    }
    return [TimeStampArray, MonthArray];
}

export function getSeasonTimeStampArray(MonthsAmong = 12,MonthOrWeek = true){
    let TimeStampArray = [];
    let MonthArray = [];

    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"}
    const SeasonName = {0:"一季度",3:"二季度",6:"三季度",9:"四季度"}
    let now = new Date(); //当前日期
    let nowMonth = now.getMonth(); //当前月
    let nowYear = now.getFullYear(); //当前年
    MonthArray.push(transSeasonName(now));
    TimeStampArray.push(Date.parse(now)/1000);
    let NowSeason = transSeasonName(now);
    for (let index = 0; index <= MonthsAmong; index++) {
        let time = new Date(nowYear, nowMonth - index);
        let timeStart = Date.parse(time)/1000;//s
        if(NowSeason != (transSeasonName(time))){
            NowSeason = transSeasonName(time);
            MonthArray.push(transSeasonName(time));
            TimeStampArray.push(timeStart);
        }
        /* example:
        * console.log("time",time,"Month",index,"timeStart",timeStart,"time.getMonth",time.getMonth());
        * time 2021-04-30T16:00:00.000Z Month 0 timeStart 1619798400 time.getMonth 4
        */
    }
    return [TimeStampArray, MonthArray];
}
/*
 * @param A_Date : like 2021-05-16T12:53:39.400Z
 * @return theMonth : like 五月
 * @author: Bernard
 * @date: 2021/5/16 20:52
 * @description:
 * @example:console.log(transMonthName(new Date()));// 2021-05-16T12:53:39.400Z
 *          五月
 */
export function transMonthName(A_Date){
    const MonthName = {0:"一月",1:"二月",2:"三月",3:"四月",4:"五月",5:"六月",
                        6:"七月",7:"八月",8:"九月",9:"十月",10:"十一月",11:"十二月"};
    let theMonth = MonthName[A_Date.getMonth()];
    return theMonth;
}
/*
 * @param A_Date : like 2021-05-16T12:53:39.400Z
 * @return: like 三季度
 * @author: Bernard
 * @date: 2021/7/1 20:28
 * @description:
 * @example:.
 *
 */
export function transSeasonName(A_Date){
    const MonthName = {0:"一季度",1:"一季度",2:"一季度",3:"二季度",4:"二季度",5:"二季度",
        6:"三季度",7:"三季度",8:"三季度",9:"四季度",10:"四季度",11:"四季度"};
    let theMonth = MonthName[A_Date.getMonth()];
    return theMonth;
}

