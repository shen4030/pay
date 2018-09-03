'use strict';

const crypto = require('crypto');
const config = require('./WxPayConfig.js');
const request = require('request');
const xml2js = require('xml2js').parseString;

/**
 * 构建参数
 */
function composeParam(params)
{
    let signedData = getSignedData(params);
    if(params){
        signedData = signature(signedData);
    }
    if(signedData){
        params.sign = signedData;
    }

    return trimAll(composeXml(params));
} 

/**
 * 构建接口所需的xml
 */
function composeXml(params)
{
	let result = '<xml>';
    for(let key in params){
        if(params.hasOwnProperty(key)){
            result += '<' + key +'>'  + params[key]  + '</' + key + '>';
        }
    }
    result += '</xml>';
    return result;
}

/**
 * 构建签名参数
 */
function getSignedData(params) 
{
    let data = [];
    if(!params){
        return null;
    }
    
    /* 参数为空与sign不参与签名 */
    for(let key in params) {
        if((!params[key]) || key === "sign") {
            continue;
        }else{
            data.push([key, params[key]]);
        }
    }

    /* 为参数排序 */
    data = data.sort();

    /* 转成url传值所需 */
    let result = '';
    for(let i = 0; i < data.length; i++) {
        let obj = data[i];
        if(i == data.length - 1) {
            result = result + obj[0] + '=' + obj[1];
        } else {
            result = result + obj[0] + '=' + obj[1] + '&';
        }
    }
    result += '&key=' + config.getConfigByKey('key');
    return result;
}

/**
 * 签名
 */
function signature(data)
{
    if (data && data.length > 0) {
        let buffer = new Buffer(data);
        let str = buffer.toString('utf-8');
        let result = crypto.createHash('md5').update(str).digest('hex');
        return result.toUpperCase();
    }
    return null;
}

/**
 * 对象转xml
 */
function objectToXml(object)
{
    let builder = new xml2js.Builder();
    return builder.buildObject(object);
}

/**
 * xml转对象
 */
function xmlToObject(xml, callback)
{
	xml2js(xml, {explicitArray:false}, function(error, result){
		if (error) {
			return callback(error, null);
		}else{
			callback(null, result);
		}
	})
}

/**
 * 发送Http请求 
 */
function sendHttpRequest(type, url, param, callback)
{
    switch(type.toLowerCase()){
        case 'get':
        sendGetHttpRequest(url, param, callback);
        break;
        case 'post': 
        sendPostHttpRequest(url, param, callback);
        break;
    }
}


function sendGetHttpRequest(url, param, callback)
{
    request.get(
 		{
 			url : url, 
 			body: JSON.stringify(param)
 		}, 
 		function (error, response, body) {
 			if(error){
 				return callback(error, null);
 			}
 			callback(null, body);
 		}
 	);
}

function sendPostHttpRequest(url, param, callback)
{
    request.post(
 		{
 			url : url, 
 			body: JSON.stringify(param)
 		}, 
 		function (error, response, body) {
 			if(error){
 				return callback(error, null);
 			}
 			callback(null, body);
 		}
 	);
}

/**
 * 去除字符串内所有空格
 * @return {string} string
 */
function trimAll(string)
{   
    let result = string.replace(/(^\s+)|(\s+$)/g,"");
    return result.replace(/\s/g,"");
}

module.exports.composeParam = composeParam;
module.exports.signature = signature;
module.exports.getSignedData = getSignedData;
module.exports.xmlToObject = xmlToObject;
module.exports.composeXml = composeXml;
module.exports.isSuccess = isSuccess;
module.exports.sendHttpRequest = sendHttpRequest;

