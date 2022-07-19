import supertest  from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import app from  '../../src/app'

import {DoctorInput, Doctor} from '../../src/models/doctor.model'

const doctorId: string = new mongoose.Types.ObjectId().toString()
const slot: string = '2022-06-29T08:30:00'
const invalidId: string = '62c7d1687a90700209'
const invalidSlot: string = '2022-06-29_08:30'

const doctorPayload: DoctorInput = {
    _id: doctorId,
    name: 'Ложкин П.В.',
    spec: 'Терапевт',
    slots: [slot]
}

describe("Doctor", () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
    })
    describe('get doctor route', () => {
        describe('get one', () => {
            describe("given the doctor does not exist", () => {
                test("should return a 404 status and the message", async () => {
                    const {body, statusCode} = await supertest(app).get(`/api/doctors/get-one/${doctorId}`)
                    expect(statusCode).toBe(404)
                    expect(body).toEqual({message: "Доктор не найден"})
                })
            })
            describe("given the _id is not valid", () => {
                test("should return a 400 status and the message", async () => {
                    const {body, statusCode} = await supertest(app).get(`/api/doctors/get-one/${invalidId}`)
                    expect(statusCode).toBe(400)
                    expect(body).toEqual({message: 'ID не валиден'})
                })
            })
            describe("given the doctor does exist", () => {
                test("should return a 200 status and the found doctor", async () => {
                    await Doctor.create(doctorPayload)
                    const {body, statusCode} = await supertest(app).get(`/api/doctors/get-one/${doctorId}`)
                    expect(statusCode).toBe(200)
                    expect(body.oneDoctorFound._id).toEqual(doctorId)
                    await Doctor.deleteMany({})
                })
            })

        })
        describe('get all', () => {
            describe("given the doctors does not exist", () => {
                test("should return a 404 status and the message", async () => {
                    const {body, statusCode} = await supertest(app).get(`/api/doctors/get-all`)
                    expect(statusCode).toBe(404)
                    expect(body).toEqual({message: "Доктора не найдены"})
                })
            })
            describe("given the doctors does exist", () => {
                test("should return a 200 status and the found appointment", async () => {
                    await Doctor.create(doctorPayload)
                    const {body, statusCode} = await supertest(app).get(`/api/doctors/get-all`)
                    expect(statusCode).toBe(200)
                    expect(body.allDoctorsFound[0]._id).toEqual(doctorId)
                    await Doctor.deleteMany({})
                })
            })
        })
    })
    describe('create doctor route', () => {
        describe('given the fields are not filled in', ()=> {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/doctors/create/')
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'Поля обязательны для заполнения' })
            })
        })
        describe('given the slot was entered in the wrong format', ()=> {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/doctors/create/')
                    .send({
                        name: 'Ложкин П.В.',
                        spec: 'Терапевт',
                        slots: [invalidSlot]
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: `Слот введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss`})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the creared doctor', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/doctors/create/')
                    .send(doctorPayload)
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    createdDoctor: {
                        _id: expect.any(String),
                        name: 'Ложкин П.В.',
                        spec: 'Терапевт',
                        slots: [slot]
                    }
                })
            })
        })
    })
    describe('update doctor route', () => {
        describe('given the _id is not valid', () => {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/doctors/update/${invalidId}`)
                    .send({
                        name: 'Ложкин П.В.',
                        spec: 'Терапевт',
                        slots: [slot]
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the doctor does not exist', () => {
            test("should return a 404 status and the message", async () => {
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/doctors/update/${doctorId}`)
                    .send(doctorPayload)
                expect(statusCode).toBe(404)
                expect(body).toEqual( {message: `Доктор не найден` })
            })
        })
        describe('given the fields are not filled in', () => {
            test('should return a 400 status and the message', async () => {
                await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/doctors/update/${doctorId}`)
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'Поля обязательны для заполнения' })
                await Doctor.deleteMany({})
            })
        })
        describe('given the slot was entered in the wrong format', ()=> {
            test('should return a 400 status and the message', async () => {
                await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/doctors/update/${doctorId}`)
                    .send({
                        name: 'Ложкин П.В.',
                        spec: 'Терапевт',
                        slots: [invalidSlot]
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: `Слот введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss`})
                await Doctor.deleteMany({})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the updated doctor', async () => {
                await Doctor.create(doctorPayload)
                const newSlot = '2022:07:17T13:30:00'
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/doctors/update/${doctorId}`)
                    .send({
                        name: 'Ложкин П.В.',
                        spec: 'Старший терапевт',
                        slots: [slot, newSlot]
                    })
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    _id: doctorId,
                    name: 'Ложкин П.В.',
                    spec: 'Старший терапевт',
                    slots: [slot, newSlot]
                })
                await Doctor.deleteMany({})
            })
        })
    })
    describe('delete doctor route', () => {
        describe('given the _id is not valid', () => {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/doctors/delete/${invalidId}`)
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the doctor does not exist', () => {
            test("should return a 404 status and the message", async () => {
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/doctors/delete/${doctorId}`)
                expect(statusCode).toBe(404)
                expect(body).toEqual( {message: 'Доктор не найден' })
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and message', async () => {
                await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/doctors/delete/${doctorId}`)
                expect(statusCode).toBe(200)
                expect(body).toEqual( {message: 'Доктор успешно удален' })
                await Doctor.deleteMany({})
            })
        })
    })
})