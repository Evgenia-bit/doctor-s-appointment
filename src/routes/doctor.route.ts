import { Router } from 'express'
import {createDoctor, getAllDoctors, getDoctor, updateDoctor, deleteDoctor} from "../controllers/doctor.controller"

const doctorRoute = () => {
    const router = Router()

    router.post('/create', createDoctor)
    router.get('/get-all', getAllDoctors)
    router.get('/get-one/:doctor_id', getDoctor)
    router.patch('/update/:doctor_id', updateDoctor)
    router.delete('/delete/:doctor_id', deleteDoctor)

    return router
}

export { doctorRoute }