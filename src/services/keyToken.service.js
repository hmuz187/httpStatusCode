'use strict'

const keyTokenModel = require("../models/keyToken.model")
const { Types } = require('mongoose')

class KeyTokenService {

    static creatKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            //level 0
            // const token = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return token ? token.publicKey : null


            //level xxx
            const filter = { user: userId }, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }, options = { upsert: true, new: true }

            const token = await keyTokenModel.findOneAndUpdate(filter, update, options)

            return token ? token.publicKey : null

        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        // return await keyTokenModel.findOne({ user: Types.ObjectId({userId}) }).lean()
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) }).lean()

    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.findByIdAndRemove(id)
    }

    static findByRefreshTokenUsed = async(refreshToken) => {
        return await keyTokenModel.findOne({refreshTokenUsed: refreshToken}).lean()
    }

    static findByRefreshToken = async(refreshToken) => {
        return await keyTokenModel.findOne({refreshToken})
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.findByIdAndDelete({user: userId})
    }

}

module.exports = KeyTokenService;