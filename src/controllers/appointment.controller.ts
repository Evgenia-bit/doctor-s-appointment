import {Request, Response, NextFunction} from 'express'
import {Appointment, AppointmentInput} from '../models/appointment.model'
import {Doctor, DoctorInput} from '../models/doctor.model'
import {User, UserInput} from '../models/user.model'
// @ts-ignore
import ApiError from "../error/ApiError"
// @ts-ignore
import CheckData from "../utils/сheckData"

const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        CheckData.bodyIsExisting(req.body)
        const { user_id, doctor_id, slot } = req.body

        CheckData.idIsValid(user_id)
        CheckData.idIsValid(doctor_id)

        const doctor: DoctorInput | null = await Doctor.findById(doctor_id)
        if (!doctor) {
            throw new ApiError( 'Доктор не найден', 404)
        }

        const user: UserInput | null = await User.findById(user_id)
        if (!user) {
            throw new ApiError( 'Пользователь не найден', 404)
        }

        CheckData.slotIsExisting(doctor, slot)
        await CheckData.slotIsNotOccupied(slot)

        const appointmentInput: AppointmentInput = {
            user_id,
            doctor_id,
            slot
        }
        const createdAppointment: AppointmentInput = await Appointment.create(appointmentInput)
        return res.json({createdAppointment})
    } catch (e) {
        next(e)
    }
}

const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allFoundAppointments: AppointmentInput[] = await Appointment.find()
        if (allFoundAppointments.length === 0) {
            throw new ApiError( 'Записи не найдены', 404)
        }

        return res.json({allFoundAppointments})
    } catch (e) {
        next(e)
    }
}

const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentId = req.params.appointment_id
        CheckData.idIsValid(appointmentId)

        const oneAppointmentFound: AppointmentInput | null = await Appointment.findById(appointmentId)
        if (!oneAppointmentFound) {
            throw new ApiError( 'Запись не найдена', 404)
        }

        return res.json({oneAppointmentFound})
    } catch (e) {
        next(e)
    }
}

const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentId = req.params.appointment_id
        CheckData.idIsValid(appointmentId)

        CheckData.bodyIsExisting(req.body)
        const { user_id, doctor_id, slot } = req.body

        const appointment: AppointmentInput | null = await Appointment.findById(appointmentId)
        if (!appointment) {
            throw new ApiError( 'Запись не найдена', 404)
        }

        const user: UserInput | null = await User.findById(user_id)
        if (!user) {
            throw new ApiError( 'Пользователь не найден', 404)
        }

        const doctor: DoctorInput | null = await Doctor.findById(doctor_id)
        if (!doctor) {
            throw new ApiError( 'Доктор не найден', 404)
        }

        CheckData.slotIsExisting(doctor, slot)
        await CheckData.slotIsNotOccupied(slot)

        const updatedAppointment: AppointmentInput | null = await Appointment.findByIdAndUpdate(appointmentId,  {user_id, doctor_id, slot}, {new: true})
        return res.json(updatedAppointment)
    } catch (e) {
        next(e)
    }
}
const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appointmentId = req.params.appointment_id
        CheckData.idIsValid(appointmentId)

        const deletedAppointment: AppointmentInput | null = await Appointment.findByIdAndDelete(appointmentId)
        if (!deletedAppointment) {
            throw new ApiError( 'Запись не найдена', 404)
        }

        return res.json({message: 'Запись успешно удалена'})
    } catch (e) {
        next(e)
    }
}

export { createAppointment, getAllAppointments, getAppointment, updateAppointment, deleteAppointment }