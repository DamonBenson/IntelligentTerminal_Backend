import fs from 'fs';
import crypto from 'crypto';
import jlib from 'jingtum-lib';
const u = jlib.utils;

/*----------暂停----------*/

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @description 生成区间[min, max)的随机整数。
 * @param min:
 * @param max: 右开
 * @author: Qiumufei
 * @date: 2021/5/17 10:37
 * @description:
 * @example:.
 *
 */
export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

/*----------生成随机len位字符串----------*/

export function randomString(len) {
    const length = len;
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

/*----------按prob概率分布从res中随机选择----------*/

/**
 * @description 按prob概率分布从res数组中随机选择。
 * @param {Array}res 所有可能结果构成的数组
 * @param {Array}prob res数组中每个元素对应的被选择概率
 * @returns {any} 随机结果
 */
export function randomSelect(res, prob) {
    if(!prob) {
        prob = (new Array(res.length)).fill(1);
    }
    let sum = 0;
    let factor = 0;
    let random = Math.random();
    for(let i = prob.length - 1; i >= 0; i--) {
        sum += prob[i];
    };
    random *= sum;
    for(let i = prob.length - 1; i >= 0; i--) {
        factor += prob[i];
        if(random <= factor) {
            return res[i];
        }
    }
    return null;
}

/*----------补全数字长度----------*/

export function formatStr(num, len) {
    if(String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
}

/*----------下划线转驼峰----------*/

export function toHump(name) {
    return name.replace(/\_(\w)/g, function(all, letter){
        return letter.toUpperCase();
    });
}

/*----------驼峰转下划线----------*/

export function toLine(name) {
    return name.replace(/([A-Z])/g,"_$1").toLowerCase();
}

/*----------js命名对象转mysql命名对象----------*/

export function toMysqlObj(obj) {
    for(let key in obj) {
        if(toLine(key) != key) {
            obj[toLine(key)] = obj[key];
            delete obj[key];
        }
    }
}

/*----------mysql命名对象转js命名对象----------*/

export function fromMysqlObj(obj) {
    for(let key in obj) {
        if(toHump(key) != key) {
            obj[toHump(key)] = obj[key];
            delete obj[key];
        }
    }
    return obj;
}

// /*----------时间戳转mysql的date格式----------*/

// export function toMysqlDate(ts) {
//     return (new Date(ts * 1000)).toJSON().slice(0, 19).replace('/T.*/', ' ');
// }

/**
 * @description 将js对象转为链上的ERC721tokenInfos数据格式。
 * @param {Object}obj tokensInfo对象
 * @returns {Object[]} 链上的ERC721tokenInfos数据格式，包括type属性名、data属性值
 */
export function obj2tokenInfos(obj) {
    let tokenInfos = [];
    for(let k in obj) {
        let tokenInfosObj = {
            type: k,
            data: obj[k].toString()
        };
        tokenInfos.push(tokenInfosObj);
    }
    return tokenInfos;
}

/**
 * @description 将链上的ERC721tokenInfos数据格式转为js对象。
 * @param {Object[]}arr 链上的ERC721tokenInfos数据，包括type属性名、data属性值
 * @returns {Object} type作为key，data作为value的js对象
 */
export function tokenInfos2obj(arr) {
    let obj = new Object();
    for(let i = arr.length - 1; i >= 0; i--) {
        let k = arr[i].type;
        let v = arr[i].data;
        obj[k] = v;
    }
    if(obj.hasOwnProperty('copyrightType')) {
        obj['copyrightType'] = Number(obj['copyrightType']);
    }
    if(obj.hasOwnProperty('idType')) {
        obj['idType'] = Number(obj['idType']);
    }
    return obj;
}

/**
 * @description 将拥有修改flag和tokenInfos权限的地址数组，转为提交链上交易需要的格式。
 * @param {String[]}flagAddrs 拥有修改flag权限的地址数组
 * @param {String[]}tokenInfosAddrs 拥有修改tokenInfos权限的地址数组
 * @returns {Object[]} 提交链上交易需要的权限列表格式，包括地址role、权限类型type
 */
export function toRolesArr(flagAddrs, tokenInfosAddrs) {

    let rolesArr = [];

    flagAddrs.forEach(flagAddr => {
        rolesArr.push({role: flagAddr, type: 1});
    });

    tokenInfosAddrs.forEach(tokenInfosAddr => {
        rolesArr.push({role: tokenInfosAddr, type: 2});
    });

    return rolesArr;
    
}

/**
 * @description 将链上的ERC721memos数据格式转为js对象。
 * @param {Object[]}arr 链上的ERC721memos数据，包括MemoType属性名、MemoData属性值
 * @returns {Object} MemoType作为key，MemoData作为value的js对象
 */
export function memos2obj(arr) {
    let obj = new Object();
    for(let i = arr.length - 1; i >= 0; i--) {
        let k = arr[i].MemoType;
        let v = arr[i].MemoData;
        obj[k] = v;
    }
    return obj;
}

export function saveJson(json, path) {

    json = JSON.stringify(json);

    return new Promise((resolve, reject) => {

        fs.open(path, 'w', (err, fd) => {
            if (err) reject(err);
            fs.appendFile(fd, json, 'utf8', (err) => {
                if (err) reject(err);
            });
            fs.close(fd, (err) => {
                if (err) reject(err);
                let hash = getFileHash(path)
                resolve(hash);
            });
        });

    })

}

export function getFileHash(filePath) {

    let file = fs.readFileSync(filePath);
    let sha256 = crypto.createHash('sha256');
    let hash = sha256.update(file).digest('hex');
    return hash;

}