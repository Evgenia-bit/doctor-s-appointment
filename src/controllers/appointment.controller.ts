import { Request, Response } from 'express';
import { Appointment, AppointmentInput } from '../models/appointment.model';
import { Doctor, DoctorInput } from '../models/doctor.model';
import { User, UserInput } from '../models/user.model';

const createAppointment = async (req: Request, res: Response) => {
    const user_id: string = req.body.user_id
    const doctor_id: string = req.body.doctor_id
    const slot: string = req.body.slot
    if (!user_id || !doctor_id || !slot) {
        return res.status(422).json({ message: 'Поля user_id, doctor_id и slot обязательны для заполнения' });
    }
    const doctor: DoctorInput | null  =  await Doctor.findById(doctor_id)
    if(!doctor) {
        return res.json({ message: `Доктора с id = ${doctor_id} не существует!` });
    }
    const user: UserInput | null  =  await User.findById(user_id)
    if(!user) {
        return res.json({ message: `Пользователя с id = ${user_id} не существует!` });
    }
    if(!doctor.slots.includes(slot)) {
        return res.json({ message: 'Данного слота не существует!' });
    }
    const existingAppointment: AppointmentInput | null = await Appointment.findOne({slot})
    if(existingAppointment) {
        return res.json({ message: 'Данный слот уже занят!' });
    }
    const appointmentInput: AppointmentInput = {
        user_id,
        doctor_id,
        slot
    }
    const appointmentCreated: AppointmentInput = await Appointment.create(appointmentInput);
    return res.json({ appointmentCreated });
};

const getAllAppointments = async (req: Request, res: Response) => {
    const appointments: AppointmentInput[] | null = await Appointment.find();
    return res.json({ appointments });
};

const getAppointment = async (req: Request, res: Response) => {
    const id: string = req.params.appointment_id
    const appointment: AppointmentInput | null = await Appointment.findById(id)
    return res.json({ appointment })
}

const updateAppointment = async (req: Request, res: Response) => {
    const id: string = req.params.appointment_id
    const user_id: string = req.body.user_id
    const doctor_id: string = req.body.doctor_id
    const slot: string = req.body.slot
    const appointment: AppointmentInput | null = await Appointment.findById(id);
    if(!appointment) {
        return res.status(404).json({ message: `Запись с ${id} не найдена.` });
    }
    if (!user_id && !doctor_id && !slot) {
        return res.status(422).json({ message: 'Обязательно должно быть запонено хотябы одно поле для изменения' });
    }
    if(user_id) {
        const user: UserInput | null = await User.findById(user_id)
        if(user) {
            await Appointment.findByIdAndUpdate( id , { user_id });
        } else {
            return res.status(404).json({ message: `Пользователь с id = ${id} не найден.` });
        }
    }
    if(doctor_id) {
        const doctor: DoctorInput | null = await Doctor.findById(doctor_id)
        if(doctor) {
            await Appointment.updateOne({ _id: id }, { doctor_id });
            appointment.doctor_id = doctor_id
        }else {
            return res.status(404).json({ message: `Доктор с id = ${id} не найден.` });
        }
    }
    if(slot) {
        const existingSlot: DoctorInput | null = await Doctor.findOne({_id: appointment.doctor_id, slots: slot})
        if(!existingSlot) {
            return res.status(404).json({ message: `Слот ${slot} не существует!` });
        }
        const existingAppointment: AppointmentInput | null = await Appointment.findOne({slot})
        if(existingAppointment) {
            return res.json({ message: `Слот ${slot} уже занят!` });
        }
        await Appointment.updateOne({ _id: id }, { slot });
    }
    const updatedAppointment: AppointmentInput | null = await Appointment.findById(id);
    return res.json(updatedAppointment)
}
const deleteAppointment = async (req: Request, res: Response) => {
    const id: string = req.params.appointment_id

    const deletedAppointment: AppointmentInput | null = await Appointment.findByIdAndDelete(id)
    if(deletedAppointment) {
        return res.json({ message: 'Запись успешно удалена' })
    } else {
        return res.status(404).json({ message: `Запись с id = ${id} не найдена` })
    }

}

export { createAppointment, getAllAppointments, getAppointment, updateAppointment, deleteAppointment };