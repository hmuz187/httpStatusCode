const statusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409
}

const reasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLICT: 'Conflict error'
}

class ErrorResponse extends Error {
    constructor(message, status){
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message=reasonStatusCode.CONFLICT, statusCode=statusCode.CONFLICT){
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message=reasonStatusCode.FORBIDDEN, statusCode=statusCode.FORBIDDEN){
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError
}