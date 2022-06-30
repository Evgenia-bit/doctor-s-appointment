require('dotenv').config()
import mongoose from 'mongoose';


const connectToDB = async (): Promise<void> => {
    await mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}`);

};

export { connectToDB };