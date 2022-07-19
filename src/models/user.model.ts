import mongoose, { Schema, Model, Document } from 'mongoose'

type UserDocument = Document & {
    _id?: string,
    phone: string,
    name: string
}
type UserInput = {
    _id?: UserDocument['_id']
    phone: UserDocument['phone'],
    name: UserDocument['name'],
}

const usersSchema = new Schema(
    {
        phone: {
            type: Schema.Types.String,
            required: true,
        },
        name: {
            type: Schema.Types.String,
            required: true,
        }
    },
    {
        collection: 'users',
        versionKey: false
    }
)

const User: Model<UserDocument> = mongoose.model<UserDocument>('User', usersSchema)

export { User, UserInput, UserDocument }