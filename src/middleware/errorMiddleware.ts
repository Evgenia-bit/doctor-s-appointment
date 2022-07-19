import { Response, Request, NextFunction} from 'express'

const ApiError = require('../error/ApiError')

function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction)  {
    if (err instanceof ApiError) {
        return res.status(err.code).json({message: err.message})
    }
    return res.status(500).json({message: `Непредвиденная ошибка! ${err.message}`})
}

module.exports = errorMiddleware