import { Request, Response, NextFunction } from 'express'
import { User, UserInput } from '../models/user.model'
// @ts-ignore
import ApiError from "../error/ApiError"
// @ts-ignore
import CheckData from "../utils/сheckData"


const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        CheckData.bodyIsExisting(req.body)
        const { phone, name } = req.body

        const userInput: UserInput = {
            phone,
            name,
        }
        const createdUser: UserInput = await User.create(userInput)
        return res.json({ createdUser })
    } catch (e) {
        next(e)
    }
}
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allUsersFound: UserInput[] = await User.find()
        if(allUsersFound.length === 0) {
            throw new ApiError( 'Пользователи не найдены', 404)
        }

        return res.json({ allUsersFound })

    } catch (e) {
        next(e)
    }
}

const getUser = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const userId = req.params.user_id
        CheckData.idIsValid(userId)

        const oneUserFound: UserInput | null = await User.findOne({ _id: userId })
        if(!oneUserFound) {
            throw new ApiError( 'Пользователь не найден', 404)
        }

        return res.json({ oneUserFound })
    } catch (e) {
        next(e)
    }
}

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId= req.params.user_id
        CheckData.idIsValid(userId)

        CheckData.bodyIsExisting(req.body)
        const { phone, name } = req.body

        const user: UserInput | null = await User.findById(userId)
        if(!user) {
            throw new ApiError( 'Пользователь не найден', 404)
        }

        const updatedUser: UserInput | null = await User.findByIdAndUpdate(userId, {name, phone}, {new: true})
        return res.json(updatedUser)
    } catch (e) {
        next(e)
    }
}

const deleteUser = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const userId = req.params.user_id
        CheckData.idIsValid(userId)

        const deletedUser: UserInput | null = await User.findByIdAndDelete(userId)
        if(!deletedUser) {
            throw new ApiError( 'Пользователь не найден', 404)
        }

        return res.json({ message: 'Пользователь успешно удален' })
    } catch (e) {
        next(e)
    }
}

export { createUser, getAllUsers, getUser, updateUser, deleteUser }