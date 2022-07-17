import {Types} from "mongoose"
// @ts-ignore
import ApiError from "../error/ApiError"
import {DoctorInput} from "../models/doctor.model";
import {Appointment, AppointmentInput} from "../models/appointment.model";
class СheckData {
    static idIsValid (id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new ApiError( 'ID не валиден', 400)
        }
    }
    static bodyIsExisting (body: any) {
        if (!Object.keys(body).length) {
            throw new ApiError( 'Поля обязательны для заполнения', 400)
        }
    }
    static slotIsExisting (doctor: DoctorInput, slot: string) {
        if (!doctor.slots.includes(slot)) {
            throw new ApiError( 'Данного слота не существует', 404)
        }
    }
    static async slotIsNotOccupied (slot: string) {
        const appointmentForThisSlot: AppointmentInput | null = await Appointment.findOne({slot})
        if (appointmentForThisSlot) {
            throw new ApiError( 'Данный слот уже занят', 409)
        }
    }
}

module.exports = СheckData