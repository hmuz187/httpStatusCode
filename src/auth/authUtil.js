'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const creatTokenPair = async (payload, publicKey, privateKey) => {
    try {
        //payload chứa thông tin vận chuyển từ hệ thống này sang hệ thống khác thông qua token
        const accessToken = await JWT.sign(payload, publicKey, {
            expiresIn: '2 days'
        })
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error(`error verify:: `, error)
            } else {
                console.log(`decode verify:: `, decode)
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {

    }
}


const authentication = asyncHandler(async (req, res, next) => {
    /*
        1- check userId missing???
        2- get accessToken
        3- verify Token
        4- check user in db
        5- check keyStore with this userId
        6- OK all => return next()
    */

    //1
    const userId = req.headers[HEADER.CLIENT_ID]
    if(!userId) throw new AuthFailureError('Invalid Request')
    //2
    const keyStore = await findByUserId(userId)
    if(!keyStore) throw NotFoundError(`Not found keyStore`)
    //3
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if(!accessToken) throw new AuthFailureError(`Invalid request`)
    try{
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError(`Invalid userId`)
        req.keyStore = keyStore
        return next()
    } catch(error){
        throw error
    }    
})


const verifyTokenJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    creatTokenPair,
    authentication,
    verifyTokenJWT
}