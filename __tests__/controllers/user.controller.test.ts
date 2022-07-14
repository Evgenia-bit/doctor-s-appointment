import app from  '../../src/app'
import supertest  from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {UserInput, User} from '../../src/models/user.model'

const userId: string = new mongoose.Types.ObjectId().toString()
const invalidId: string = '62c7d1687a90700209'

const userPayload: UserInput = {
    _id: userId,
    phone: '+7 900 000 00 00',
    name: 'Иванова О.М.'
}

describe("User", () => {

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
    })
    describe('get user route', () => {
        describe('get one', () => {
            describe("given the user does not exist", () => {
                test("should return a 404 status and the message", async () => {
                    const {body, statusCode} = await supertest(app).get(`/api/users/get-one/${userId}`)
                    expect(statusCode).toBe(404)
                    expect(body).toEqual({message: "Пользователь не найден"})
                })
            })
            describe("given the _id is not valid", () => {
                test("should return a 400 status and the message", async () => {
                    const {body, statusCode} = await supertest(app).get(`/api/users/get-one/${invalidId}`)
                    expect(statusCode).toBe(400)
                    expect(body).toEqual({message: 'ID не валиден'})
                })
            })
            describe("given the user does exist", () => {
                test("should return a 200 status and the found doctor", async () => {
                    const user = await User.create(userPayload)
                    const {body, statusCode} = await supertest(app).get(`/api/users/get-one/${userId}`)
                    expect(statusCode).toBe(200)
                    expect(body.oneUserFound._id).toEqual(userId)
                    await User.deleteMany({})
                })
            })

        })
        describe('get all', () => {
            describe("given the users does not exist", () => {
                test("should return a 404 status and the message", async () => {
                    const {body, statusCode} = await supertest(app).get(`/api/users/get-all`)
                    expect(statusCode).toBe(404)
                    expect(body).toEqual({message: "Пользователи не найдены"})
                })
            })
            describe("given the users does exist", () => {
                test("should return a 200 status and the found appointment", async () => {
                    const users = await User.create(userPayload)
                    const {body, statusCode} = await supertest(app).get(`/api/users/get-all`)
                    expect(statusCode).toBe(200)
                    expect(body.allUsersFound[0]._id).toEqual(userId)
                    await User.deleteMany({})
                })
            })
        })
    })
    describe('create user route', () => {
        describe('given the fields are not filled in', ()=> {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/users/create/')
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'Поля phone и name обязательны для заполнения' })
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the creared doctor', async () => {
                const {body, statusCode } = await supertest(app)
                    .post('/api/users/create/')
                    .send(userPayload)
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    createdUser: {
                        _id: expect.any(String),
                        phone: '+7 900 000 00 00',
                        name: 'Иванова О.М.'
                    }
                })
            })
        })
    })
    describe('update user route', () => {
        describe('given the _id is not valid', () => {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/users/update/${invalidId}`)
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the user does not exist', () => {
            test("should return a 404 status and the message", async () => {
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/users/update/${userId}`)
                    .send({})
                expect(statusCode).toBe(404)
                expect(body).toEqual( {message: `Пользователь с id = ${userId} не найден` })
            })
        })
        describe('given the fields are not filled in', () => {
            test('should return a 400 status and the message', async () => {
                const users = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/users/update/${userId}`)
                    .send({})
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'Обязательно должно быть заполнено хотябы одно поле для изменения' })
                await User.deleteMany({})
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and the updated user', async () => {
                const users = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .patch(`/api/users/update/${userId}`)
                    .send({
                        phone: '+7 950-444-53-26'
                    })
                expect(statusCode).toBe(200)
                expect(body).toEqual({
                    _id: userId,
                    phone: '+7 950-444-53-26',
                    name: 'Иванова О.М.'
                })
                await User.deleteMany({})
            })
        })
    })
    describe('delete user route', () => {
        describe('given the _id is not valid', () => {
            test('should return a 400 status and the message', async () => {
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/users/delete/${invalidId}`)
                expect(statusCode).toBe(400)
                expect(body).toEqual({ message: 'ID не валиден' })
            })
        })
        describe('given the user does not exist', () => {
            test("should return a 404 status and the message", async () => {
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/users/delete/${userId}`)
                expect(statusCode).toBe(404)
                expect(body).toEqual( {message:  `Пользователь с id = ${userId} не найден` })
            })
        })
        describe('given the everything is normal', ()=> {
            test('should return a 200 status and message', async () => {
                const users = await User.create(userPayload)
                const {body, statusCode } = await supertest(app)
                    .delete(`/api/users/delete/${userId}`)
                expect(statusCode).toBe(200)
                expect(body).toEqual( {message: `Пользователь успешно удален` })
                await User.deleteMany({})
            })
        })
    })
})