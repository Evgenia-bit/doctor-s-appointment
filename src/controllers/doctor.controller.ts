import { Request, Response } from 'express'
import { Doctor, DoctorInput } from '../models/doctor.model'
import {Types} from "mongoose"

const createDoctor = async (req: Request, res: Response) => {
    const slots: string[] = req.body.slots
    const name: string = req.body.name
    const spec: string = req.body.spec
    if (!name || !spec || !slots) {
        return res.status(400).json({ message: 'Поля name, spec и slots обязательны для заполнения' })
    }
    let invalidSlot: string | undefined = slots.find( slot => {
        if (slot.length !== 19 &&  isNaN(Date.parse(slot))) {
            return true
        }
    })
    if(invalidSlot) {
        return res.status(400).json({ message: `Слот ${invalidSlot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss` })
    }
    const doctorInput: DoctorInput = {
        name,
        spec,
        slots
    }
    const createdDoctor: DoctorInput = await Doctor.create(doctorInput)
    return res.json({ createdDoctor })
}
const getAllDoctors = async (req: Request, res: Response) => {
    const allDoctorsFound: DoctorInput[] = await Doctor.find()
    if(allDoctorsFound.length === 0) {
        return res.status(404).json({ message: "Доктора не найдены" })
    } else {
        return res.json({ allDoctorsFound })
    }
}
const getDoctor = async (req: Request, res: Response) => {
    const doctorId: string = req.params.doctor_id
    if(!Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const oneDoctorFound: DoctorInput | null = await Doctor.findById(doctorId)
    if(!oneDoctorFound) {
        return res.status(404).json({ message: "Доктор не найден" })
    } else {
        return res.json({ oneDoctorFound })
    }

}
const updateDoctor = async (req: Request, res: Response) => {
    const doctorId: string = req.params.doctor_id
    if(!Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const slots: string[] = req.body.slots
    const name: string = req.body.name
    const spec: string = req.body.spec
    const doctor: DoctorInput | null = await Doctor.findById(doctorId)
    if(!doctor) {
        return res.status(404).json({ message: `Доктор с id = ${doctorId} не найден` })
    }
    if (!name && !spec && !slots) {
        return res.status(400).json({ message: 'Обязательно должно быть заполнено хотябы одно поле для изменения' })
    }
    if(name) {
        await Doctor.findByIdAndUpdate( doctorId , { name })
    }
    if(spec) {
        await Doctor.findByIdAndUpdate( doctorId , { spec })
    }
    if(slots) {
        let invalidSlot: string | undefined = slots.find( slot => {
            if (slot.length !== 19 &&  isNaN(Date.parse(slot))) {
                return true
            }
        })
        if(invalidSlot) {
            return res.status(400).json({ message: `Слот ${invalidSlot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss` })
        }
        await Doctor.findByIdAndUpdate( doctorId , { slots })
    }
    const updatedDoctor: DoctorInput | null = await Doctor.findById(doctorId)
    return res.json(updatedDoctor)
}
const deleteDoctor = async (req: Request, res: Response) => {
    const doctorId: string = req.params.doctor_id
    if(!Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'ID не валиден' })
    }
    const deletedDoctor: DoctorInput | null = await Doctor.findByIdAndDelete(doctorId)
    if(deletedDoctor) {
        return res.json({ message: 'Доктор успешно удален' })
    } else {
        return res.status(404).json({ message: `Доктор с id = ${doctorId} не найден` })
    }
}
export { getAllDoctors, getDoctor, updateDoctor, deleteDoctor,  createDoctor }