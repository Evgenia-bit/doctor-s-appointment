import { Request, Response, NextFunction } from 'express'
import { Doctor, DoctorInput } from '../models/doctor.model'
import {Types} from "mongoose"
// @ts-ignore
import ApiError from "../error/ApiError"
// @ts-ignore
import CheckData from "../utils/сheckData"


async function checkDataForSlotUpdates  (doctorId: string, slot: string): Promise<DoctorInput> {
    CheckData.idIsValid(doctorId)
    const doctor: DoctorInput | null = await Doctor.findById(doctorId)
    if(!doctor) {
        throw new ApiError( 'Доктор не найден', 404)
    }
    CheckData.slotIsValid(slot)
    return doctor
}
const addSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctorId: string = req.params.doctor_id
        const slot: string = req.body.slot
        const doctor = await checkDataForSlotUpdates(doctorId, slot)
        CheckData.slotIsNotExisting(doctor, slot)
        await Doctor.findByIdAndUpdate( doctorId , { $push: { slots: slot } })
        return res.json({ message: 'Слот успешно добавлен' })
    } catch (e) {
        next(e)
    }

}
const deleteSlot = async (req: Request, res: Response,  next: NextFunction) => {
    try {
        const doctorId: string = req.params.doctor_id
        const slot: string = req.body.slot
        const doctor = await checkDataForSlotUpdates(doctorId, slot)
        CheckData.slotIsExisting(doctor, slot)
        await Doctor.findByIdAndUpdate( doctorId ,  { $pull: { slots: slot } })
        return res.json({ message: 'Слот успешно удалён' })
    } catch (e) {
        next(e)
    }
}

export { addSlot, deleteSlot }