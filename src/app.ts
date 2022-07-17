require('dotenv').config()
import express, {Express, Response, Request, NextFunction, RequestHandler} from 'express'
import { userRoute } from './routes/user.route'
import { doctorRoute } from './routes/doctor.route'
import { appointmentRoute } from './routes/appointment.route'
import { slotRoute } from './routes/slot.route'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from '../src/swagger/openapi.json'
// @ts-ignore
import errorMiddleware from './middleware/errorMiddleware'
// @ts-ignore
import ApiError from "./error/ApiError"

const app: Express = express()

app.use(cors() as RequestHandler)

app.use(express.json())

app.use('/api/users', userRoute())
app.use('/api/doctors', doctorRoute())
app.use('/api/appointments', appointmentRoute())
app.use('/api/slots', slotRoute())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.use(errorMiddleware)

app.use((req: Request, res: Response)=> {
    res.status(404)
    res.json({status: 'error', msg: 'Такой страницы не существует'})
})
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message)
    res.status(500)
    res.json({status: 'error', msg: 'Произошла ошибка сервера'})
})

export default app
