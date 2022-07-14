import { Request, Response } from 'express'
import { Types } from "mongoose"
import { User, UserInput } from '../models/user.model'


const createUser = async (req: Request, res: Response) => {
    const phone: string = req.body.phone
    const name: string   = req.body.name
    if (!phone || !name ) {
        return res.status(400).json({ message: 'Поля phone и name обязательны для заполнения' })
    }
    const userInput: UserInput = {
        phone,
        name,
    }
    const createdUser: UserInput = await User.create(userInput)
    return res.json({ createdUser })
}
const getAllUsers = async (req: Request, res: Response) => {
    const allUsersFound: UserInput[] = await User.find()
    if(allUsersFound.length === 0) {
        return res.status(404).json({ message: "Пользователи не найдены" })
    } else {
        return res.json({ allUsersFound })
    }
}

const getUser = async (req: Request, res: Response) => {
    const userId: string = req.params.user_id
    if(!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const oneUserFound: UserInput | null = await User.findOne({ _id: userId })
    if(!oneUserFound) {
        return res.status(404).json({ message: "Пользователь не найден" })
    } else {
        return res.json({ oneUserFound })
    }

}

const updateUser = async (req: Request, res: Response) => {
    const userId: string = req.params.user_id
    if(!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const phone: string = req.body.phone
    const name: string   = req.body.name
    const user: UserInput | null = await User.findById(userId)
    if(!user) {
        return res.status(404).json({ message: `Пользователь с id = ${userId} не найден` })
    }
    if (!phone && !name) {
        return res.status(400).json({ message: 'Обязательно должно быть заполнено хотябы одно поле для изменения' });
    }
    if(phone) {
        await User.findByIdAndUpdate( userId , { phone })
    }
    if(name) {
        await User.findByIdAndUpdate( userId , { name })
    }
    const updatedUser: UserInput | null = await User.findById(userId)
    return res.json(updatedUser)
}

const deleteUser = async (req: Request, res: Response) => {
    const userId: string = req.params.user_id
    if(!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const deletedUser: UserInput | null = await User.findByIdAndDelete(userId)
    if(!deletedUser) {
        return res.status(404).json({ message: `Пользователь с id = ${userId} не найден` })
    } else {
        return res.json({ message: 'Пользователь успешно удален' })
    }
}

export { createUser, getAllUsers, getUser, updateUser, deleteUser }