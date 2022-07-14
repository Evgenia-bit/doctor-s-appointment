const cron = require('node-cron')
import fs = require('fs')
import { Appointment, AppointmentInput } from '../models/appointment.model'
import { User, UserInput } from '../models/user.model'
import { Doctor, DoctorInput } from '../models/doctor.model'

function sendMessage(msg: string):void {
    fs.appendFile('notices.log', msg, function (err: any) {
        if (err) throw err;
        const fileContent = fs.readFileSync("notices.log", "utf8")
        console.log('Saved!', fileContent)
    })
}

module.exports = () => {
    cron.schedule('* * * * *', async () => {
        const dateNow: Date = new Date()
        const appointments: AppointmentInput[] | null = await Appointment.find()
        let user: UserInput | null
        let doctor: DoctorInput | null
        let slot: Date
        let hoursBeforeAppointment: string
        let message: string
        for(const appointment of appointments ) {
            slot = new Date(appointment.slot)
            hoursBeforeAppointment = ((slot.getTime() - dateNow.getTime()) / (1000 * 60 * 60)).toFixed(2)
            if(hoursBeforeAppointment === '24.00') {
                user = await User.findById(appointment.user_id)
                doctor = await Doctor.findById(appointment.doctor_id)
                message = `${dateNow} | Привет, ${user?.name}! Напоминаем что вы записаны к ${doctor?.spec}у завтра в ${slot}!`
                sendMessage(message)
            } else if(hoursBeforeAppointment === '2.00') {
                user = await User.findById(appointment.user_id)
                doctor = await Doctor.findById(appointment.doctor_id)
                message = `${dateNow.toLocaleString()} | Привет, ${user?.name}! Вам через 2 часа к ${doctor?.spec}у в ${slot.toLocaleString()}!`
                sendMessage(message)
            }
        }
    })
}