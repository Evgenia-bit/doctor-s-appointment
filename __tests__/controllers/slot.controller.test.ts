import app from  '../../src/app'
import supertest  from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {DoctorInput, Doctor} from '../../src/models/doctor.model'

const doctorId: string = new mongoose.Types.ObjectId().toString()
const slot: string = '2022:06:29T08:30:00'
const invalidId: string = '62c7d1687a90700209'
const invalidSlot: string = '2022:06:29_08:30'
const newSlot: string = '2022:07:11T11:30:00'

const doctorPayload: DoctorInput = {
    _id: doctorId,
    name: 'Ложкин П.В.',
    spec: 'Терапевт',
    slots: [slot]
}


describe("Slot", () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
    })
    describe('add slot route', () => {
        describe("given the _id is not valid", () => {
            test("should return a 400 status and the message", async () => {
                const {body, statusCode } = await supertest(app).patch(`/api/slots/add/${invalidId}`)
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the doctor is not found', ()=> {
            test('should return a 404 status and the message', async () => {
                const {body, statusCode } = await supertest(app).patch(`/api/slots/add/${doctorId}`)
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Доктор с id = ${doctorId} не найден`})
            })
        })
        describe('given the slot was entered in the wrong format', ()=> {
            test('should return a 400 status and the message', async () => {
                const doctor =  await Doctor.create(doctorPayload)
                const {body, statusCode } =  await supertest(app)
                    .patch(`/api/slots/add/${doctorId}`)
                    .send({
                        slot: invalidSlot
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: `Слот ${invalidSlot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss`})
                await Doctor.deleteMany({})
            })
        })
        describe('given the slot is occupied', () => {
            test('should return a 409 status and the message', async () => {
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/slots/add/${doctorId}`)
                    .send({slot})
                expect(statusCode).toBe(409)
                expect(body).toEqual({ message: `Слот ${slot} уже существует у данного доктора` })
                await Doctor.deleteMany({})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the updated doctor', async () => {
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/slots/add/${doctorId}`)
                    .send({slot: newSlot})
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    _id: doctorId,
                    name: 'Ложкин П.В.',
                    spec: 'Терапевт',
                    slots: [slot, newSlot]
                })
                await Doctor.deleteMany({})
            })
        })
    })
    describe('delete slot route', () => {
        describe("given the _id is not valid", () => {
            test("should return a 400 status and the message", async () => {
                const {body, statusCode } = await supertest(app).patch(`/api/slots/delete/${invalidId}`)
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the doctor is not found', ()=> {
            test('should return a 404 status and the message', async () => {
                const {body, statusCode } = await supertest(app).patch(`/api/slots/delete/${doctorId}`)
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Доктор с id = ${doctorId} не найден`})
            })
        })
        describe('given the slot was entered in the wrong format', ()=> {
            test('should return a 400 status and the message', async () => {
                const doctor =  await Doctor.create(doctorPayload)
                const {body, statusCode } =  await supertest(app)
                    .patch(`/api/slots/delete/${doctorId}`)
                    .send({
                        slot: invalidSlot
                    })
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: `Слот ${invalidSlot} введён в неверном формате. Все даты должны быть записаны в формате YYYY-MM-DDThh:mm:ss`})
                await Doctor.deleteMany({})
            })
        })
        describe('given the slot is occupied', () => {
            test('should return a 404 status and the message', async () => {
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/slots/delete/${doctorId}`)
                    .send({
                        slot: newSlot
                    })
                expect(statusCode).toBe(404)
                expect(body).toEqual({ message: `Слот ${newSlot} не существует у данного доктора` })
                await Doctor.deleteMany({})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the updated doctor', async () => {
                const doctor = await Doctor.create(doctorPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/slots/delete/${doctorId}`)
                    .send({slot})
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    _id: doctorId,
                    name: 'Ложкин П.В.',
                    spec: 'Терапевт',
                    slots: []
                })
                await Doctor.deleteMany({})
            })
        })
    })
})