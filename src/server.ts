import { connectToDB } from './db/db-connect'
import app from "./app"
require('dotenv').config()

const port = process.env.PORT

require('./shedulers/schedulers')()

app.listen(port, () => {
    connectToDB()
        .then(() => {
            console.log('Сonnection to MongoDB is established')
        })
        .catch(err => {
            console.error('App starting error:', err.message)
        })
    console.log(`The server is running on the port ${port}`)
})

process.on('uncaughtException', err => {
    console.error(err.stack)
    process.exit(1)
})