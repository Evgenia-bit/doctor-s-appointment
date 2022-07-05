require('dotenv').config()
import mongoose from 'mongoose'


const connectToDB = async (): Promise<void> => {
    await mongoose.connect(`${process.env.ME_CONFIG_MONGODB_URL}`)

}

export { connectToDB }