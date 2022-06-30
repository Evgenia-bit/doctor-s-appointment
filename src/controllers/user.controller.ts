import { Request, Response } from 'express'
import { User, UserInput } from '../models/user.model'


const createUser = async (req: Request, res: Response) => {
    const phone: string = req.body.phone
    const name: string   = req.body.name
    if (!phone || !name ) {
        return res.status(422).json({ message: 'Поля phone и name обязательны для заполнения' });
    }
    const userInput: UserInput = {
        phone,
        name,
    }
    const userCreated: UserInput = await User.create(userInput)
    return res.json({ userCreated })
}
const getAllUsers = async (req: Request, res: Response) => {
    const users: UserInput[] = await User.find()
    return res.json({ users })
}

const getUser = async (req: Request, res: Response) => {
    const id: string = req.params.user_id
    const user: UserInput | null = await User.findOne({ _id: id });
    return res.json({ user })
}

const updateUser = async (req: Request, res: Response) => {
    const id: string = req.params.user_id
    const phone: string = req.body.phone
    const name: string   = req.body.name
    const user: UserInput | null = await User.findById(id)
    if(!user) {
        return res.status(404).json({ message: `Пользователь с ${id} не найден.` })
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
    const deleteUser: UserInput | null = await User.findByIdAndDelete(id)
    if(deleteUser) {
        return res.json({ message: 'Пользователь успешно удален' })
    } else {
        return res.status(404).json({ message: `Пользователь с id = ${id} не найден` })
    }
}

export { createUser, getAllUsers, getUser, updateUser, deleteUser }