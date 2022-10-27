import http from 'http';
import fs from 'fs';
import querystring from 'querystring';
import formData from 'form-data';

export function get(url, data) {

    url = new URL(url);

    let dataStr = querystring.stringify(data);

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname + '?' + dataStr,
        method: 'GET',
    };

    return new Promise((resolve, reject) => {

        let req = http.get(options, function(res) {

            res.setEncoding('utf8');
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', function(){
                let parsedData = JSON.parse(data);
                resolve(parsedData);
            });

        });

        req.on('error', function(e) {
            reject(e.message);
        });

    });

}

export function post(url, data) {

    url = new URL(url);

    data = JSON.stringify(data);

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                let parsedData = JSON.parse(data);
                resolve(parsedData);
            });

        });

        req.on('error', e => {
            reject(e.message);
        });

        req.write(data);
        req.end();

    });

}

export function postFormData(url, data) {
    url = new URL(url);

    let form = new formData();
    for(let key in data) {
        form.append(key, data[key]);
    }
    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: form.getHeaders(),
    };
    return new Promise((resolve, reject) => {
        let req = http.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                resolve(body.toString());

            });

            res.on("error", function (error) {
                console.error(error);
            });
        });
        form.pipe(req);
    });
}
export function postFiles(url, fileInfo) {

    url = new URL(url);

    let form = new formData();
    for(let key in fileInfo) {
        if(Array.isArray(fileInfo[key])) {
            for(let i in fileInfo[key]) {
                form.append(key, fs.createReadStream(fileInfo[key][i]));
            }
        }
        else {
            form.append(key, fileInfo[key]);
        }
    }
    let headers = form.getHeaders();

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: headers,
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                let parsedData = JSON.parse(data);
                resolve(parsedData);
            });

        });

        form.pipe(req);

    });

}

/**
 * @description 从url处下载文件
 * @param {string}urlString 下载路径
 * @param {String}savePath 存储路径
 * @returns {Object} 下载文件数据
 */
export function downloadFile(urlString = "http://i1.hexun.com/2019-12-30/199821260.jpg", savePath = ".\\cer.jpg") {
    let url = new URL(urlString);

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            let data = Buffer.from("");

            res.on('data', chunk => {
                data = Buffer.concat([data, chunk]);
            });

            res.on('end', () => {
                fs.writeFileSync(savePath, data, () => {});
                resolve(data);
            });

        });

        req.on('error', e => {
            reject(e.message);
        });
        req.write('');
        req.end();

    })
}

/**
 * @description 从url处下载Base64文件
 * @param {string}urlString 下载路径
 * @param {String}savePath 存储路径
 * @returns {Object} 下载文件数据
 */
 export function downloadBase64(urlString, savePath) {

    let options = {
        host: '116.196.114.120',
        port: 8080,
        path: '/bupt/works/downloadFile',
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            res.setEncoding('utf8');
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                let parsedData = JSON.parse(data);
                let buffer = new Buffer(parsedData.data, 'base64');
                fs.writeFileSync(savePath, buffer, () => {});
                resolve(parsedData);
            });

        });

        req.on('error', e => {
            reject(e.message);
        });
        req.write(JSON.stringify({fileAddress: urlString}));
        req.end();

    })
}

/**
 * @description 从url处下载文件
 * @param {string}url 下载路径
 * @param {String}savePath 存储路径
 * @returns {Object} IPFSURL
 */
export function downloadToIPFS(urlString = "http://i1.hexun.com/2019-12-30/199821260.jpg") {
    let url = new URL(urlString);

    let options = {
        host: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    };

    return new Promise((resolve, reject) => {

        let req = http.request(options, res => {

            let data = Buffer.from("");

            res.on('data', chunk => {
                data = Buffer.concat([data, chunk]);
            });

            res.on('end', () => {
                let ipfsUrl = ipfsUtils.addRaw(data);//这里的addRaw 相当于 addFile（测试过，一样的hash）
                resolve(ipfsUrl);
            });

        });

        req.on('error', e => {
            reject(e.message);
        });
        req.write('');
        req.end();

    })
}
