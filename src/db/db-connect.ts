import mongoose from 'mongoose'
require('dotenv').config()

const connectToDB = async (): Promise<void> => {
    await mongoose.connect(`${process.env.ME_CONFIG_MONGODB_URL}`)
}

export { connectToDB }