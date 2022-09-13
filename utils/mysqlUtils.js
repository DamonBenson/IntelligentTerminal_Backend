/**
 * @description 通过sql语句操作数据库。
 * @param {Object}c 数据库连接对象
 * @param {String}sql sql语句
 * @returns {Object} 数据库操作结果
 */
export function sql(c, sql) {
    return new Promise((resolve, reject) => {
        c.query(sql, function(err, result) {
            if(err) {
                console.log('err:', err);
                reject('err');
            }
            else if(result) {
                resolve(result);
            }
        });
    });
}