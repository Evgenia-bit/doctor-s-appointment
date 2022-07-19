import mongoose, { Schema, Model, Document } from 'mongoose'

type AppointmentDocument = Document & {
    _id?: string,
    user_id: string,
    doctor_id: string,
    slot: string
}
type AppointmentInput = {
    _id?: AppointmentDocument['_id'],
    user_id: AppointmentDocument['user_id'],
    doctor_id: AppointmentDocument['doctor_id'],
    slot: AppointmentDocument['slot'],
}

const appointmentsSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        doctor_id: {
            type: Schema.Types.ObjectId,
            ref: 'Doctor',
            required: true,
        },
        slot: {
            type: Schema.Types.String,
            required: true,
        }
    },
    {
        collection: 'appointments',
        versionKey: false
    }
)

const Appointment: Model<AppointmentDocument> = mongoose.model<AppointmentDocument>('Appointment', appointmentsSchema)

export { Appointment, AppointmentInput, AppointmentDocument }