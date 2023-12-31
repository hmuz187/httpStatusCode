'use strict'


//check request Header
const HEADER = {
    API_KEY : 'x-api-key',
    AUTHORIZATION : 'authorization' 
}

const {findById} = require('../services/apiKey.service')

//check apiKey
const apiKey = async(req, res, next) => {
    try{
        const key=req.headers[HEADER.API_KEY]?.toString()

        if(!key){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }
        
        const objKey = await findById(key)

        if(!objKey){
            return res.status(403).json({
                message: 'Forbidden Error'
            })
        }

        req.objKey = objKey
        return next()

    } catch(error){

    }
}


//hàm closure: là hàm trả về 1 hàm (mà hàm trả về này có thể sử dụng các biến của hàm cha)
const permission = (permission) => {
    return (req, res, next) => {
        if(!req.objKey.permission){
            return res.status(403).json({
                message: 'Permission denied'
            })
        }

        console.log(`permission:: `, req.objKey.permission)

        const validPermission = req.objKey.permission.includes(permission)

        if(!validPermission){
            return res.status(403).json({
                message: 'Permission denied'
            })
        }

        return next()
    }
}


module.exports = {
    apiKey,
    permission,
}