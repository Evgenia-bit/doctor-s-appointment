require('dotenv').config()
import express, {Express, Response, Request, NextFunction, RequestHandler} from 'express'
import { connectToDB } from './db/db-connect'
import { userRoute } from './routes/user.route'
import { doctorRoute } from './routes/doctor.route'
import { appointmentRoute } from './routes/appointment.route'
import { slotRoute } from './routes/slot.route'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from '../src/swagger/openapi.json'
import cors from 'cors'
const port = process.env.PORT

const app: Express = express()

app.use(cors() as RequestHandler)

require('./shedulers/schedulers')()

app.use(express.json())

app.use('/api/users', userRoute())
app.use('/api/doctors', doctorRoute())
app.use('/api/appointments', appointmentRoute())
app.use('/api/slot', slotRoute())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req: Request, res: Response)=> {
    res.status(404)
    res.json({status: 'error', msg: 'Такой страницы не существует'})
})
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message)
    res.status(500)
    res.json({status: 'error', msg: 'Произошла ошибка сервера'})
})

app.listen(port, () => {
    connectToDB()
        .then(() => {
            console.log('Сonnection to MongoDB is established')
        })
        .catch(err => {
            console.error('App starting error:', err.message);
        })
    console.log(`The server is running on the port ${port}`)
})
process.on('uncaughtException', err => {
    console.error('НЕПЕРЕХВАЧЕНОЕ ИСКЛЮЧЕНИЕ\n', err.stack)
    process.exit(1)
})