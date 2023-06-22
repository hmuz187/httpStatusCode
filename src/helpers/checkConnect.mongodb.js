const mongoose = require('mongoose')
const os = require('node:os')
const process = require('node:process')
const _SECOND = 5000

const countConnect = () =>{
    return mongoose.connections.length
}

const checkOverLoad = () =>{
    setInterval(()=>{
        const numConnection = mongoose.connections.length
        const numCore = os.cpus().length
        const memoryUsage = process.memoryUsage().rss

        const maxConnection = numCore * 10

        // console.log(`Memory Usage: ${memoryUsage/1024/1024} MB`)
        
        if(numConnection>maxConnection){
            console.log(`Detected Over Load in Mongodb!`)
            return false
        }

        return true

    }, _SECOND)
}

module.exports = {
    countConnect, 
    checkOverLoad
}