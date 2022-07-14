import { Request, Response } from 'express'
import { Doctor, DoctorInput } from '../models/doctor.model'
import {Types} from "mongoose"


const addSlot = async (req: Request, res: Response) => {
    const slotId: string = req.params.doctor_id
    if(!Types.ObjectId.isValid(slotId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const slot: string = req.body.slot
    const doctor: DoctorInput | null = await Doctor.findById(slotId)
    if(!doctor) {
        return res.status(404).json({ message: `Доктор с id = ${slotId} не найден` })
    }
    if (slot.length !== 19 &&  isNaN(Date.parse(slot))) {
        return res.status(400).json({ message: `Слот ${slot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss` })
    }
    if(doctor.slots.includes(slot)) {
        return res.status(409).json({ message: `Слот ${slot} уже существует у данного доктора` })
    }
    await Doctor.findByIdAndUpdate( slotId , { $push: { slots: slot } })
    return res.json({ message: 'Слот успешно добавлен' })
}
const deleteSlot = async (req: Request, res: Response) => {
    const slotId: string = req.params.doctor_id
    if(!Types.ObjectId.isValid(slotId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const slot: string = req.body.slot
    const doctor: DoctorInput | null = await Doctor.findById(slotId)
    if(!doctor) {
        return res.status(404).json({ message: `Доктор с id = ${slotId} не найден` })
    }
    if (slot.length !== 19 &&  isNaN(Date.parse(slot))) {
        return res.status(400).json({ messageVariable names changed: `Слот ${slot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss` })
    }
    if(!doctor.slots.includes(slot)) {
        return res.status(404).json({ message: `Слот ${slot} не существует у данного доктора` })
    }
    await Doctor.findByIdAndUpdate( slotId ,  { $pull: { slots: slot } })
    return res.json({ message: 'Слот успешно удалён' })
}

export { addSlot, deleteSlot }