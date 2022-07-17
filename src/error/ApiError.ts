module.exports = class ApiError extends Error {
    constructor (  message: string, public code: number) {
        super()
        this.code = code|| 500
        this.message = message
    }
}