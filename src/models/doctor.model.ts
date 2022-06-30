import mongoose, { Schema, Model, Document } from 'mongoose'

type DoctorDocument = Document & {
    name: string,
    spec: string,
    slots: string[]
}
type DoctorInput = {
    name: DoctorDocument['name'],
    spec: DoctorDocument['spec'],
    slots: DoctorDocument['slots'],

}

const doctorsSchema = new Schema(
    {
        name: {
            type: Schema.Types.String,
            required: true,
        },
        spec: {
            type: Schema.Types.String,
            required: true,
        },
        slots: {
            type: [Schema.Types.String]
        }
    },
    {
        collection: 'doctors',
        versionKey: false
    }
)

const Doctor: Model<DoctorDocument> = mongoose.model<DoctorDocument>('Doctor', doctorsSchema)

export { Doctor, DoctorInput, DoctorDocument }