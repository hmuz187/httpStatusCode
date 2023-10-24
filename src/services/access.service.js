'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { creatTokenPair, verifyTokenJWT } = require("../auth/authUtil")
const { getInfoData } = require("../utils/index.lodash")

const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require("./shop.service")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    static handleRefreshToken = async (refreshToken) => {

        //check token đã được sử dụng chưa
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)

        //nếu có thì 
        if(foundToken){
            //decode xem user là ai
            const {userId, email} = await verifyTokenJWT(refreshToken, foundToken.privateKey)
            console.log({userId, email})
            //xóa tất cả token trong keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError(`Something wrong happend!!! Please re-login`)
        }

        //nếu không có
        const holderToken = await KeyTokenService.findByRefreshToken({refreshToken})
        if(!holderToken) throw new AuthFailureError(`Shop is not registered!!`)

        //verifyToken
        const {userId, email} = await verifyTokenJWT(refreshToken, foundToken.privateKey)
        console.log(`[2] -- `,{userId, email})

        //check UserId
        const foundShop = await findByEmail(email)
        if(!foundShop) throw new AuthFailureError(`Shop is not registered!! `)

        //nếu tìm thấy user(foundShop) thì cấp refreshToken mới
        //tạo 1 cặp mới
        const token = await creatTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        //update token
        await holderToken.update({
            $set: {
                refreshToken: token.refreshToken
            },
            $addToSet: {
                refreshTokenUsed : refreshToken     //đã được sử dụng để lấy token mới
            }
        })

        return {
            user: {userId, email},
            token
        }
    }

    static logout = async(keyStore)=>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        // console.log({delKey})
        return delKey
    }

    static login = async ({ email, password, refreshToken = null }) => {

        //1
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new BadRequestError(`Shop is not registered!`)

        //2
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError(`Authentication error`)

        //3
        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')

        //4
        const { _id: userId } = foundShop
        // const token = await creatTokenPair({ userId: foundShop._id, email }, publicKey, privateKey)
        const token = await creatTokenPair({ userId, email }, publicKey, privateKey)

        //5
        await KeyTokenService.creatKeyToken({
            userId,
            privateKey,
            publicKey,
            refreshToken: token.refreshToken
        })


        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            token
        }

    }

    static signUp = async ({ name, email, password }) => {
        // try{
        //check email exist

        const holderShop = await shopModel.findOne({ email }).lean();

        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!')
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {

            const privateKey = crypto.randomBytes(64).toString('hex');
            const publicKey = crypto.randomBytes(64).toString('hex');

            const keyStore = await KeyTokenService.creatKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                throw new BadRequestError('Error: keyStore error')
                // return {
                //     code: '.....',
                //     message: 'publicKeyString error'
                // }
            }

            // created token pair
            const token = await creatTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

            console.log(`Created Token Success::`, token)

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                    token
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }

        // } catch(error) {
        //     return {
        //         status: 'ERROR',
        //         code: 'xxx',
        //         message: error.message,
        //     }
        // }
    }
}

module.exports = AccessService