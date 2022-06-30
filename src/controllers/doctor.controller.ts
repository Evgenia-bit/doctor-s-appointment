import { Request, Response } from 'express';
import { Doctor, DoctorInput } from '../models/doctor.model';

const createDoctor = async (req: Request, res: Response) => {
    const slots: string[] = req.body.slots
    const name: string = req.body.name
    const spec: string = req.body.spec
    if (!name || !spec || !slots) {
        return res.status(422).json({ message: 'Поля name, spec и slots обязательны для заполнения' });
    }
    let invalidSlot: string | undefined = slots.find( slot => {
        if (slot.length !== 19 &&  isNaN(Date.parse(slot))) {
            return true
        }
    })
    if(invalidSlot) {
        return res.status(422).json({ message: `Слот ${invalidSlot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss` })
    }
    const doctorInput: DoctorInput = {
        name,
        spec,
        slots
    }
    const doctorCreated: DoctorInput = await Doctor.create(doctorInput)
    return res.json({ doctorCreated })
}
const getAllDoctors = async (req: Request, res: Response) => {
    const doctors: DoctorInput[] = await Doctor.find()
    return res.json({ doctors })
}
const getDoctor = async (req: Request, res: Response) => {
    const id: string = req.params.doctor_id
    const doctor: DoctorInput | null = await Doctor.findById(id)
    return res.json({ doctor })
}
const updateDoctor = async (req: Request, res: Response) => {
    const id: string = req.params.doctor_id
    const slots: string[] = req.body.slots
    const name: string = req.body.name
    const spec: string = req.body.spec
    const doctor: DoctorInput | null = await Doctor.findById(id)
    if(!doctor) {
        return res.status(404).json({ message: `Доктор с ${id} не найден.` })
    }
    if (!name && !spec && !slots) {
        return res.status(422).json({ message: 'Обязательно должно быть заполнено хотябы одно поле для изменения' });
    }
    if(name) {
        await Doctor.findByIdAndUpdate( id , { name });
    }
    if(spec) {
        await Doctor.findByIdAndUpdate( id , { spec });
    }
    if(slots) {
        let invalidSlot: string | undefined = slots.find( slot => {
            if (slot.length !== 19 &&  isNaN(Date.parse(slot))) {
                return true
            }
        })
        if(invalidSlot) {
            return res.status(422).json({ message: `Слот ${invalidSlot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss` })
        }
        await Doctor.findByIdAndUpdate( id , { slots });
    }
    const updatedDoctor: DoctorInput | null = await Doctor.findById(id);
    return res.json(updatedDoctor)
}
const deleteDoctor= async (req: Request, res: Response) => {
    const id: string = req.params.doctor_id
    const deleteDoctor: DoctorInput | null = await Doctor.findByIdAndDelete(id)
    if(deleteDoctor) {
        return res.json({ message: 'Доктор успешно удален' })
    } else {
        return res.status(404).json({ message: `Доктор с id = ${id} не найден` })
    }
}
export { getAllDoctors, getDoctor, updateDoctor, deleteDoctor,  createDoctor };