'use strict'

const JWT = require('jsonwebtoken');

const creatTokenPair = async (payload, publicKey, privateKey) => {
    try{
        //payload chứa thông tin vận chuyển từ hệ thống này sang hệ thống khác thông qua token
        const accessToken = await JWT.sign(payload, privateKey,{
            algorithm: 'RS256',
            expiresIn: '2 days'
        }) 
        const refreshToken = await JWT.sign(payload, privateKey,{
            algorithm: 'RS256',
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (err, decode)=>{
            if(err){
                console.error(`error verify:: `, err)
            } else {
                console.log(`decode verify:: `, decode)
            }
        })

        return {accessToken, refreshToken}
    } catch(error){

    }
}

module.exports = { 
    creatTokenPair,
}