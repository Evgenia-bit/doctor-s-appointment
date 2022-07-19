const cron = require('node-cron')
import fs = require('fs')

import { Appointment, AppointmentInput } from '../models/appointment.model'
import { User, UserInput } from '../models/user.model'
import { Doctor, DoctorInput } from '../models/doctor.model'


class Notification {

    dateNow: Date
    appointment: AppointmentInput

    constructor(dateNow: Date, appointment: AppointmentInput ) {
        this.dateNow = dateNow
        this.appointment = appointment
    }

    protected async getDataForGenerateMessage() {
        const user: UserInput | null = await User.findById(this.appointment.user_id)
        if(!user) {
            throw new Error( 'Пользователь не найден')
        }

        const doctor: DoctorInput | null = await Doctor.findById(this.appointment.doctor_id)
        if(!doctor) {
            throw new Error( 'Доктор не найден')
        }

        return {
            userName: user.name,
            doctorSpec: doctor.spec,
            slot: this.appointment.slot
        }
    }

    sendMessage(message: string): void {
        fs.appendFile('notices.log', message, function (err: any) {
            if (err) throw err
            const fileContent = fs.readFileSync("notices.log", "utf8")
            console.log('Saved!', fileContent)
        })
    }
}

class TwentyFourHoursNotification extends Notification {
    async generateMessage(): Promise<string> {
        const { userName, doctorSpec, slot } = await this.getDataForGenerateMessage()
        return `${this.dateNow.toLocaleString()} | Привет, ${userName}! Напоминаем что вы записаны к ${doctorSpec}у завтра в ${slot.toLocaleString()}!`
    }
}

class TwoHoursNotification extends Notification {
    async generateMessage(): Promise<string> {
        const { userName, doctorSpec, slot } = await this.getDataForGenerateMessage()
        return  `${this.dateNow.toLocaleString()} | Привет, ${userName}! Вам через 2 часа к ${doctorSpec}у в ${slot.toLocaleString()}!`
    }
}

async function createNotification(notification: TwoHoursNotification | TwentyFourHoursNotification): Promise<void> {
    const message = await notification.generateMessage()
    notification.sendMessage(message)
}

function getHoursBeforeAppointment(slot: Date, dateNow: Date): string {
    return ((slot.getTime() - dateNow.getTime()) / (1000 * 60 * 60)).toFixed(2)
}

function isTwentyFourHoursLeft(hours: string): boolean {
    return hours === '24.00'
}

function isTwoHoursLeft(hours: string): boolean  {
    return hours === '2.00'
}

module.exports = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const dateNow: Date = new Date()
            const appointments: AppointmentInput[] | null = await Appointment.find()
            let hoursBeforeAppointment: string
            let notification: TwentyFourHoursNotification | TwoHoursNotification

            for(const appointment of appointments ) {
                hoursBeforeAppointment = getHoursBeforeAppointment(new Date(appointment.slot), dateNow)

                if(isTwentyFourHoursLeft(hoursBeforeAppointment)) {
                    notification = new TwentyFourHoursNotification(dateNow, appointment)
                    await createNotification(notification)
                }
                else if(isTwoHoursLeft(hoursBeforeAppointment)) {
                    notification = new TwoHoursNotification(dateNow, appointment)
                    await createNotification(notification)
                }
            }
        } catch (e: any) {
            console.error(e.message)
        }
    })
}

