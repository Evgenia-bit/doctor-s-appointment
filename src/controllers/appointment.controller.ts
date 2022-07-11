import {Request, Response} from 'express'
import {Appointment, AppointmentInput} from '../models/appointment.model'
import {Doctor, DoctorInput} from '../models/doctor.model'
import {User, UserInput} from '../models/user.model'
import {Types} from "mongoose"

const createAppointment = async (req: Request, res: Response) => {
    const user_id: string = req.body.user_id
    const doctor_id: string = req.body.doctor_id
    const slot: string = req.body.slot
    if (!user_id || !doctor_id || !slot) {
        return res.status(400).json({message: 'Поля user_id, doctor_id и slot обязательны для заполнения'})
    }
    if (!Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({message: 'user_id не валиден'})
    }
    if (!Types.ObjectId.isValid(doctor_id)) {
        return res.status(400).json({message: 'doctor_id не валиден'})
    }
    const doctor: DoctorInput | null = await Doctor.findById(doctor_id)
    if (!doctor) {
        return res.status(404).json({message: `Доктор с id = ${doctor_id} не найден`})
    }
    const user: UserInput | null = await User.findById(user_id)
    if (!user) {
        return res.status(404).json({message: `Пользователь с id = ${user_id} не найден`})
    }
    if (!doctor.slots.includes(slot)) {
        return res.status(404).json({message: 'Данного слота не существует'})
    }
    const existingAppointment: AppointmentInput | null = await Appointment.findOne({slot})
    if (existingAppointment) {
        return res.status(409).json({message: 'Данный слот уже занят'})
    }
    const appointmentInput: AppointmentInput = {
        user_id,
        doctor_id,
        slot
    }
    const createdAppointment: AppointmentInput = await Appointment.create(appointmentInput)
    return res.json({createdAppointment})
}

const getAllAppointments = async (req: Request, res: Response) => {
    const foundAppointments: AppointmentInput[] = await Appointment.find()
    if (foundAppointments.length === 0) {
        return res.status(404).json({message: "Записи не найдены"})
    } else {
        return res.json({foundAppointments})
    }
}

const getAppointment = async (req: Request, res: Response) => {
    const id: string = req.params.appointment_id
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: 'ID не валиден'})
    }
    const foundAppointment: AppointmentInput | null = await Appointment.findById(id)
    if (!foundAppointment) {
        return res.status(404).json({message: "Запись не найдена"})
    }
    return res.json({foundAppointment})
}

const updateAppointment = async (req: Request, res: Response) => {
    const id: string = req.params.appointment_id
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: 'ID не валиден'})
    }
    const user_id: string = req.body.user_id
    const doctor_id: string = req.body.doctor_id
    const slot: string = req.body.slot
    const appointment: AppointmentInput | null = await Appointment.findById(id)
    if (!appointment) {
        return res.status(404).json({message: `Запись с id = ${id} не найдена`})
    }
    if (!user_id && !doctor_id && !slot) {
        return res.status(400).json({message: 'Обязательно должно быть заполнено хотябы одно поле для изменения'})
    }
    if (user_id) {
        const user: UserInput | null = await User.findById(user_id)
        if (user) {
            await Appointment.findByIdAndUpdate(id, {user_id})
        } else {
            return res.status(404).json({message: `Пользователь с id = ${user_id} не найден`})
        }
    }
    if (doctor_id) {
        const doctor: DoctorInput | null = await Doctor.findById(doctor_id)
        if (doctor) {
            await Appointment.updateOne({_id: id}, {doctor_id})
            appointment.doctor_id = doctor_id
        } else {
            return res.status(404).json({message: `Доктор с id = ${doctor_id} не найден`})
        }
    }
    if (slot) {
        const existingSlot: DoctorInput | null = await Doctor.findOne({_id: appointment.doctor_id, slots: slot})
        if (!existingSlot) {
            return res.status(404).json({message: `Слот ${slot} не существует`})
        }
        const existingAppointment: AppointmentInput | null = await Appointment.findOne({slot})
        if (existingAppointment) {
            return res.status(409).json({message: `Слот ${slot} уже занят`})
        }
        await Appointment.updateOne({_id: id}, {slot})
    }
    const updatedAppointment: AppointmentInput | null = await Appointment.findById(id)
    return res.json(updatedAppointment)
}
const deleteAppointment = async (req: Request, res: Response) => {
    const id: string = req.params.appointment_id
    if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({message: 'ID не валиден'})
    }
    const deletedAppointment: AppointmentInput | null = await Appointment.findByIdAndDelete(id)
    if (deletedAppointment) {
        return res.json({message: 'Запись успешно удалена'})
    } else {
        return res.status(404).json({message: `Запись с id = ${id} не найдена`})
    }
}

export {createAppointment, getAllAppointments, getAppointment, updateAppointment, deleteAppointment}