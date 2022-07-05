import { Router } from 'express'
import { createUser, getAllUsers, getUser, updateUser, deleteUser  } from '../controllers/user.controller'

const userRoute = () => {
    const router = Router()

    router.post('/create', createUser)
    router.get('/get-all', getAllUsers)
    router.get('/get-one/:user_id', getUser)
    router.patch('/update/:user_id', updateUser)
    router.delete('/delete/:user_id', deleteUser)

    return router
}

export { userRoute }