import { Router } from 'express'
import {addSlot, deleteSlot} from "../controllers/slot.controller"

const slotRoute = () => {
    const router = Router()

    router.patch('/add/:doctor_id', addSlot)
    router.patch('/delete/:doctor_id', deleteSlot)

    return router
}

export { slotRoute }