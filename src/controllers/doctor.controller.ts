import {NextFunction, Request, Response} from 'express'
import { Doctor, DoctorInput } from '../models/doctor.model'
// @ts-ignore
import ApiError from "../error/ApiError"
// @ts-ignore
import CheckData from "../utils/сheckData"


const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        CheckData.bodyIsExisting(req.body)
        const slots: string[] = req.body.slots
        const { name, spec } = req.body

        slots.forEach(slot => {
            CheckData.slotIsValid(slot)
        })

        const doctorInput: DoctorInput = {
            name,
            spec,
            slots
        }
        const createdDoctor: DoctorInput = await Doctor.create(doctorInput)
        return res.json({ createdDoctor })
    } catch (e) {
        next(e)
    }
}
const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allDoctorsFound: DoctorInput[] = await Doctor.find()
        if(allDoctorsFound.length === 0) {
            throw new ApiError( "Доктора не найдены", 404)
        }

        return res.json({ allDoctorsFound })
    } catch (e) {
        next(e)
    }
}
const getDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId = req.params.doctor_id
        CheckData.idIsValid(doctorId)

        const oneDoctorFound: DoctorInput | null = await Doctor.findById(doctorId)
        if(!oneDoctorFound) {
            throw new ApiError( "Доктор не найден", 404)
        }

        return res.json({ oneDoctorFound })
    } catch (e) {
        next(e)
    }
}
const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId = req.params.doctor_id
        CheckData.idIsValid(doctorId)

        CheckData.bodyIsExisting(req.body)
        const slots: string[] = req.body.slots
        const { name, spec } = req.body

        const doctor: DoctorInput | null = await Doctor.findById(doctorId)
        if(!doctor) {
            throw new ApiError( "Доктор не найден", 404)
        }

        slots.forEach(slot => {
            CheckData.slotIsValid(slot)
        })

        const updatedDoctor: DoctorInput | null = await Doctor.findByIdAndUpdate(doctorId, {name, spec, slots}, {new: true})
        return res.json(updatedDoctor)
    } catch (e) {
        next(e)
    }
}
const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId = req.params.doctor_id
        CheckData.idIsValid(doctorId)

        const deletedDoctor: DoctorInput | null = await Doctor.findByIdAndDelete(doctorId)
        if(!deletedDoctor) {
            throw new ApiError( "Доктор не найден", 404)
        }

        return res.json({ message: 'Доктор успешно удален' })
    } catch (e) {
        next(e)
    }
}
export { getAllDoctors, getDoctor, updateDoctor, deleteDoctor,  createDoctor }