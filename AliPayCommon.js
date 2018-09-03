'use strict';

const fs = require('fs');
const crypto = require('crypto');
const config = require('./AliPayConfig.js');
const request = require('superagent');

/**
 * 构建 参数
 */
function composeParam(params)
{
    let requestParam = getRequestUrl(params);
    let sign = signature(params);
    let result = requestParam + '&sign_type=' + config.getConfigByKey('sign_type')+ '&sign=' + sign;
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
            result = result + obj[0] + '=' + obj[1] + '';
        } else {
            result = result + obj[0] + '=' + obj[1] + '&';
        }
    }

    return result;
}

/**
 * 为最后的地址构建参数
 */
function getRequestUrl(params) 
{
    let data = [];
    if(!params){
        return null;
    }
    
    for(let key in params) {
        if((!params[key]) || key === "sign" || key === "sign_type") {
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
            result = result + obj[0] + '=' + encodeURIComponent(obj[1]) + '';
        } else {
            result = result + obj[0] + '=' + encodeURIComponent(obj[1]) + '&';
        }
    }

    return result;
}

/**
 * 签名
 */
function signature(params) 
{
    try {
        /* 读取私钥 */
        let privatePem = fs.readFileSync(__dirname + '/app_private_key.pem');
        let key = privatePem.toString();
        let str = getSignedData(params)
        let sign = crypto.createSign('RSA-SHA256');
        sign.update(str);
        sign = sign.sign(key, 'base64');
        
        return encodeURIComponent(sign);

    } catch(err) {
        console.log('签名错误：', err)
    }
}

/**
 * 将参数做urldecode
 */
function decodeVerifyParams(params)
{
    let result = {};
    for(let key in params){ 
        result[key] = params[key];
    }
    return result;
}

/**
 * 获取需要验签的参数
 */
function getVerifyParams(params) 
{
    let verifyParams = [];
    if(!params) return null;
    for(let key in params) {
        if((!params[key]) || key == "sign" || key == "sign_type" || 
        key == "filter_params" || key == "access_token") {
            continue;
        };
        verifyParams.push([key, params[key]]);
    }
    verifyParams = verifyParams.sort();
    let result = '';
    for(let i2 = 0; i2 < verifyParams.length; i2++) {
        let obj = verifyParams[i2];
        if(i2 == verifyParams.length - 1) {
            result = result + obj[0] + '=' + obj[1] + '';
        } else {
            result = result + obj[0] + '=' + obj[1] + '&';
        }
    }
    return result;
}

/**
 * 验证签名
 */
function veriySign(params) 
{
    try {
        let publicPem = fs.readFileSync(__dirname + '/app_public_key.pem');
        let publicKey = publicPem.toString();
        let str = getVerifyParams(params);
        var sign = params['sign'] ? params['sign'] : "";
        sign = decodeURIComponent(sign);
        var verify = crypto.createVerify('RSA-SHA256');
        verify.update(str);
        return verify.verify(publicKey, sign, 'base64');

    } catch(err) {
        console.log('验签错误:', err);
    }
}

/**
 * 验证签名
 */
function verifySignature(params)
{
    params = decodeVerifyParams(params);
    return veriySign(params);
}

/**
 * 发送请求
 */
function sendHttpRequest(url, param, callback)
{
    request.get(url)
        .query(param)
        .end(function(error, result){
            if(error){
                return callback(error, null);
            }
            callback(null, result);
        })
}

module.exports.composeParam = composeParam;
module.exports.verifySignature = verifySignature;
module.exports.sendHttpRequest = sendHttpRequest;