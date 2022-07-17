import app from  '../../src/app'
import supertest  from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {AppointmentInput, Appointment} from '../../src/models/appointment.model'
import {DoctorInput, Doctor} from '../../src/models/doctor.model'
import {UserInput, User} from '../../src/models/user.model'


const appointmentId: string = new mongoose.Types.ObjectId().toString()
const userId: string = new mongoose.Types.ObjectId().toString()
const doctorId: string = new mongoose.Types.ObjectId().toString()
const slot: string = '2022:06:29T08:30:00'
const invalidId: string = '62c7d1687a90700209'
const fakeSlot: string = '2020:06:29T08:30:00'


const appointmentPayload: AppointmentInput = {
    _id: appointmentId,
    user_id: userId,
    doctor_id: doctorId,
    slot: slot
}

const doctorPayload: DoctorInput = {
    _id: doctorId,
    name: 'Ложкин П.В.',
    spec: 'Терапевт',
    slots: [slot]
}

const userPayload: UserInput = {
    _id: userId,
    phone: '+7 900 000 00 00',
    name: 'Иванова О.М.'
}

describe("Appointment", () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
    })
    describe('get appointment route', ()=> {
        describe('get one', () => {
            describe("given the appointment does not exist", () => {
                test("should return a 404 status and the message", async () => {
                    const {body, statusCode } = await supertest(app).get(`/api/appointments/get-one/${appointmentId}`)
                    expect(statusCode).toBe(404)
                    expect(body).toEqual( {message: "Запись не найдена" })
                })
            })
            describe("given the _id is not valid", () => {
                test("should return a 400 status and the message", async () => {
                    const {body, statusCode } = await supertest(app).get(`/api/appointments/get-one/${invalidId}`)
                    expect(statusCode).toBe(400)
                    expect(body).toEqual({ message: 'ID не валиден' })
                })
            })
            describe("given the appointment does exist", () => {
                test("should return a 200 status and the found appointment", async () => {
                    const appointment =  await Appointment.create(appointmentPayload)
                    const { body, statusCode } = await supertest(app).get(`/api/appointments/get-one/${appointment._id}`)
                    expect(statusCode).toBe(200)
                    expect(body.oneAppointmentFound._id).toEqual(appointment._id.toString())
                    await Appointment.deleteMany({})
                })
            })

        })
        describe('get all', () => {
            describe("given the appointments does not exist", () => {
                test("should return a 404 status and the message", async () => {
                    const {body, statusCode } = await supertest(app).get(`/api/appointments/get-all`)
                    expect(statusCode).toBe(404)
                    expect(body).toEqual( {message: "Записи не найдены" })
                })
            })
            describe("given the appointments does exist", () => {
                test("should return a 200 status and the found appointment", async () => {
                    const appointments =  await Appointment.create(appointmentPayload)
                    const { body, statusCode } = await supertest(app).get(`/api/appointments/get-all`)
                    expect(statusCode).toBe(200)
                    expect(body.allFoundAppointments[0]._id).toEqual(appointments._id.toString())
                    await Appointment.deleteMany({})
                })
            })
        })
    })
    describe('create appointment route', () => {
        describe('given the slot is occupied', () => {
            test('should return a 409 status and the message', async () => {
                const appointment = await Appointment.create(appointmentPayload)
                const doctor = await Doctor.create(doctorPayload)
                const user = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send(appointmentPayload)
                expect(statusCode).toBe(409)
                expect(body).toEqual({ message: 'Данный слот уже занят' })
                await Appointment.deleteMany({})
                await Doctor.deleteMany({})
                await User.deleteMany({})
            })
        })
        describe('given the fields are not filled in', ()=> {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'Поля обязательны для заполнения' })
            })
        })
        describe('given the user_id is not valid', ()=> {
            test('should return a 400 status and the message', async () => {

                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send({
                        user_id: invalidId,
                        doctor_id: doctorId,
                        slot: slot
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the doctor_id is not valid', ()=> {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send({
                        user_id: userId,
                        doctor_id: invalidId,
                        slot: slot
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the doctor is not found', ()=> {
            test('should return a 404 status and the message', async () => {
                const user = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send(appointmentPayload)
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Доктор не найден`})
                await User.deleteMany({})
            })
        })
        describe('given the user is not found', ()=> {
            test('should return a 404 status and the message', async () => {
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send(appointmentPayload)
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Пользователь не найден`})
                await Doctor.deleteMany({})
            })
        })
        describe('given the slot is not found', ()=> {
            test('should return a 404 status and the message', async () => {
                const user = await User.create(userPayload)
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send({
                        user_id: userId,
                        doctor_id: doctorId,
                        slot: fakeSlot
                    })
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Данного слота не существует`})
                await User.deleteMany({})
                await Doctor.deleteMany({})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the creared appointment', async () => {
                const user = await User.create(userPayload)
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .post('/api/appointments/create/')
                    .send(appointmentPayload)
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    createdAppointment: {
                        _id: expect.any(String),
                        user_id: userId,
                        doctor_id: doctorId,
                        slot: slot
                    }
                })
                await User.deleteMany({})
                await Doctor.deleteMany({})
            })
        })
    })
    describe('update appointment route', () => {
        describe('given the _id is not valid', () => {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${invalidId}`)
                    .send({
                        user_id: userId,
                        doctor_id: doctorId,
                        slot: slot
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the appointment does not exist', () => {
            test("should return a 404 status and the message", async () => {
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send(appointmentPayload)
                expect(statusCode).toBe(404)
                expect(body).toEqual( {message: `Запись не найдена` })
            })
        })
        describe('given the fields are not filled in', () => {
            test('should return a 400 status and the message', async () => {
                const appointment =  await Appointment.create(appointmentPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'Поля обязательны для заполнения' })
                await Appointment.deleteMany({})
            })
        })
        describe('given the user is not found', ()=> {
            test('should return a 404 status and the message', async () => {
                const appointment = await Appointment.create(appointmentPayload)
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send(appointmentPayload)
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Пользователь не найден`})
                await Appointment.deleteMany({})
                await Doctor.deleteMany({})
            })
        })
        describe('given the doctor is not found', () => {
            test('should return a 404 status and the message', async () => {
                const appointment = await Appointment.create(appointmentPayload)
                const user = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send(appointmentPayload)
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Доктор не найден`})
                await Appointment.deleteMany({})
                await User.deleteMany({})
            })
        })
        describe('given the slot is not found', () => {
            test('should return a 404 status and the message', async () => {
                const appointment = await Appointment.create(appointmentPayload)
                const user = await User.create(userPayload)
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send({
                        user_id: userId,
                        doctor_id: doctorId,
                        slot: fakeSlot
                    })
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: 'Данного слота не существует'})
                await Appointment.deleteMany({})
                await User.deleteMany({})
                await Doctor.deleteMany({})
            })
        })
        describe('given the slot is occupied', () => {
            test('should return a 409 status and the message', async () => {
                const appointment = await Appointment.create(appointmentPayload)
                const doctor = await Doctor.create(doctorPayload)
                const user = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send(appointmentPayload)
                expect(statusCode).toBe(409)
                expect(body).toEqual({ message: 'Данный слот уже занят' })
                await Appointment.deleteMany({})
                await Doctor.deleteMany({})
                await User.deleteMany({})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the updated appointment', async () => {
                await Appointment.create(appointmentPayload)
                await User.create(userPayload)
                const newSlot: string = '2022:07:11T11:30:00'
                await Doctor.create({
                    _id: doctorId,
                    name: 'Ложкин П.В.',
                    spec: 'Терапевт',
                    slots: [slot, newSlot]
                })
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/appointments/update/${appointmentId}`)
                    .send({
                        user_id: userId,
                        doctor_id: doctorId,
                        slot: newSlot
                    })
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                        _id: appointmentId,
                        user_id: userId,
                        doctor_id: doctorId,
                        slot: newSlot
                })
                await Appointment.deleteMany({})
                await User.deleteMany({})
                await Doctor.deleteMany({})
            })
        })
    })
    describe('delete appointment route', () => {
        describe('given the _id is not valid', () => {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/appointments/delete/${invalidId}`)
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the appointment does not exist', () => {
            test("should return a 404 status and the message", async () => {
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/appointments/delete/${appointmentId}`)
                expect(statusCode).toBe(404)
                expect(body).toEqual( {message: `Запись не найдена` })
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and message', async () => {
                const appointment = await Appointment.create(appointmentPayload)
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/appointments/delete/${appointmentId}`)
                expect(statusCode).toBe(200)
                expect(body).toEqual( {message: `Запись успешно удалена` })
                await Appointment.deleteMany({})
            })
        })
    })
})