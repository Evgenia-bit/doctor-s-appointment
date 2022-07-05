import { Router } from 'express'
import {createAppointment, getAllAppointments, getAppointment, updateAppointment, deleteAppointment} from "../controllers/appointment.controller"

const appointmentRoute = () => {
    const router = Router()

    router.post('/create', createAppointment)
    router.get('/get-all', getAllAppointments)
    router.get('/get-one/:appointment_id', getAppointment)
    router.patch('/update/:appointment_id', updateAppointment)
    router.delete('/delete/:appointment_id', deleteAppointment)

    return router
}

export { appointmentRoute }