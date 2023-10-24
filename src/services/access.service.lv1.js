'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { creatTokenPair } = require("../auth/authUtil")
const { getInfoData } = require("../utils/index.lodash")

const RoleShop = {
    SHOP : 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async({name, email, password})=>{
        try{
            //check email exist
            const holderShop = await shopModel.findOne({email}).lean();

            if(holderShop){
                return {
                    code: 'xxx',
                    message: 'Shop already registered'
                }
            }

            const passwordHash = await bcrypt.hash(password, 10)

            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if(newShop){
                //created privateKey, publicKey
                const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1', //Public Key CryptoGraphy Standard
                        format: 'pem'  //SSL, TSL, RSA
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format:'pem'
                    }
                })
                console.log({privateKey, publicKey}) //save collection keyToken

                const publicKeyString = await KeyTokenService.creatKeyToken({
                    userId: newShop._id,
                    publicKey
                })

                if(!publicKeyString){
                    return {
                        code: '.....',
                        message: 'publicKeyString error'
                    }
                }

                console.log(`publicKeyString:: `,publicKeyString )

                const publicKeyObject = crypto.createPublicKey(publicKeyString)

                console.log(`publicKeyObject:: `,publicKeyObject )

                // created token pair
                const token = await creatTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey)

                console.log(`Created Token Success::`, token)

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name', 'email'], object: newShop}),
                        token
                    }
                }
                //

            }

            return {
                code: 200,
                metadata: null
            }

        } catch(error) {
            return {
                status: 'ERROR',
                code: 'xxx',
                message: error.message,
            }
        }
    }
}

module.exports = AccessService