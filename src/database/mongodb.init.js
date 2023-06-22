const mongoose = require('mongoose')
require('dotenv').config()

const connectionString = process.env.MONGODB_URL

const {countConnect, checkOverLoad} = require('../helpers/checkConnect.mongodb')

class Database {
    constructor(){
        this.connect()
    }

    connect(type='mongodb'){
        if(checkOverLoad()){
            mongoose.set(`debug`, true)
            mongoose.set(`debug`, {color: true})
        }
        mongoose.connect(connectionString, {
            maxPoolSize: 50
        }).then(()=> console.log(`Connected Mongodb: `, countConnect()))
        .catch(error => console.log(`Failed to connect Mongodb! `, error))
    }

    static getInstance(){
        if(!Database.instance){
            Database.instance = new Database()
        }
        return Database.instance
    }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb