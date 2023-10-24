'use strict'

const statusCode = {
    OK: 200,
    CREATED : 201
}

const reasonStatusCode = {
    OK: 'Success',
    CREATED: 'Created'
}

class SuccessResponse {
    constructor({message, statusCode = statusCode.OK, reasonStatusCode = reasonStatusCode.OK, metadata ={}}){
        this.message = !message ? reasonStatusCode : message
        this.status = statusCode
        this.metadata = metadata
    }
    
    send(res, headers = {}){
        return res.status(this.status).json(this)
    }

}

class OK extends SuccessResponse {
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse {
    constructor({message, statusCode=statusCode.CREATED, reasonStatusCode=reasonStatusCode.CREATED, metadata}){
        super({message, statusCode, reasonStatusCode, metadata})
    }
}

module.exports = {
    OK, 
    CREATED
}


