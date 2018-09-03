'use strict';

/**
 * 支付相关公有方法
 */


/**
 * 获取随机字符串
 */
function getRandomString()
{
    return Math.random().toString(36).substr(2, 15);
}

/**
 * 获取用户真实IP
 */
function getReqRemoteIp(req)
{
	let realIp = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
	return realIp;
};

/**
 * 获取十位的时间戳
 */
function getTenBitTimestamp()
{
	return parseInt(new Date().getTime() / 1000) + '';
}

/**
 * 获取yyyy-mm-dd hh:mm:ss 时间参数
 */
function getTimestamp()
{
	let date = new Date();
	let obj = {
		Y: date.getFullYear(),
		M: date.getMonth() + 1,
		D: date.getDate(),
		H: date.getHours(),
		Mi: date.getMinutes(),
		S: date.getSeconds()
	}
	var time = ' ' +supplement(obj.H) + ':' + supplement(obj.Mi) + ':' + supplement(obj.S);
	return obj.Y + '-' + supplement(obj.M) + '-' + supplement(obj.D) + time;
}

/**
 * 位数不足两位补零
 */
function supplement(nn)
{
	return nn = nn < 10 ? '0' + nn : nn;
}

/**
 * 去除字符串两端空格
 */
function trim(string) 
{ 
	return string.replace(/(^\s*)|(\s*$)/g, ""); 
}

module.exports.getReqRemoteIp = getReqRemoteIp;
module.exports.getRandomString = getRandomString;
module.exports.trim = trim;
module.exports.getTenBitTimestamp = getTenBitTimestamp;
module.exports.getTimestamp = getTimestamp;