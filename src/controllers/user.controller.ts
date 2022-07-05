import { Request, Response } from 'express'
import { Types } from "mongoose"
import { User, UserInput } from '../models/user.model'


const createUser = async (req: Request, res: Response) => {
    const phone: string = req.body.phone
    const name: string   = req.body.name
    if (!phone || !name ) {
        return res.status(422).json({ message: 'Поля phone и name обязательны для заполнения' })
    }
    const userInput: UserInput = {
        phone,
        name,
    }
    const createdUser: UserInput = await User.create(userInput)
    return res.json({ createdUser })
}
const getAllUsers = async (req: Request, res: Response) => {
    const foundUsers: UserInput[] = await User.find()
    if(foundUsers.length === 0) {
        return res.status(404).json({ message: "Пользователи не найдены" })
    } else {
        return res.json({ foundUsers })
    }
}

const getUser = async (req: Request, res: Response) => {
    const id: string = req.params.user_id
    if(!Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID не валиден' })
    }
    const foundUser: UserInput | null = await User.findOne({ _id: id })
    if(!foundUser) {
        return res.status(404).json({ message: "Пользователь не найден" })
    } else {
        return res.json({ foundUser })
    }

}

const updateUser = async (req: Request, res: Response) => {
    const id: string = req.params.user_id
    if(!Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID не валиден' })
    }
    const phone: string = req.body.phone
    const name: string   = req.body.name
    const user: UserInput | null = await User.findById(id)
    if(!user) {
        return res.status(404).json({ message: `Пользователь с id = ${id} не найден.` })
    }
    if (!phone && !name) {
        return res.status(422).json({ message: 'Обязательно должно быть запонено хотябы одно поле для изменения' });
    }
    if(phone) {
        await User.findByIdAndUpdate( id , { phone })
    }
    if(name) {
        await User.findByIdAndUpdate( id , { name })
    }
    const updatedUser: UserInput | null = await User.findById(id)
    return res.json(updatedUser)
}

const deleteUser = async (req: Request, res: Response) => {
    const id: string = req.params.user_id
    if(!Types.ObjectId.isValid(id)) {
        return res.status(422).json({ message: 'ID не валиден' })
    }
    const deletedUser: UserInput | null = await User.findByIdAndDelete(id)
    if(!deletedUser) {
        return res.status(404).json({ message: `Пользователь с id = ${id} не найден` })
    } else {
        return res.json({ message: 'Пользователь успешно удален' })
    }
}

export { createUser, getAllUsers, getUser, updateUser, deleteUser }