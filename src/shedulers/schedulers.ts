const cron = require('node-cron');
import fs = require('fs')
import { Appointment, AppointmentInput } from '../models/appointment.model';
import { User, UserInput } from '../models/user.model';
import { Doctor, DoctorInput } from '../models/doctor.model';

function sendMsg(msg: string):void {
    fs.appendFile('notices.log', msg, function (err: any) {
        if (err) throw err;
        let fileContent = fs.readFileSync("notices.log", "utf8");
        console.log('Saved!', fileContent);
    })
}

module.exports = () => {
    cron.schedule('* * * * *', async () => {
        const dateNow: Date = new Date()
        const appointments: AppointmentInput[] | null = await Appointment.find()
        let user: UserInput | null
        let doctor: DoctorInput | null
        let dateSlot: Date
        let hours: string
        let messageText: string
        for(const appointment of appointments ) {
            dateSlot = new Date(appointment.slot)
            hours = ((dateSlot.getTime() - dateNow.getTime()) / (1000 * 60 * 60)).toFixed(2)
            if(hours === '24.00') {
                user = await User.findById(appointment.user_id)
                doctor = await Doctor.findById(appointment.doctor_id)
                messageText = `${dateNow} | Привет, ${user?.name}! Напоминаем что вы записаны к ${doctor?.spec}у завтра в ${dateSlot}!`
                sendMsg(messageText)
            } else if(hours === '2.00') {
                user = await User.findById(appointment.user_id)
                doctor = await Doctor.findById(appointment.doctor_id)
                messageText = `${dateNow.toLocaleString()} | Привет, ${user?.name}! Вам через 2 часа к ${doctor?.spec}у в ${dateSlot.toLocaleString()}!`
                sendMsg(messageText)
            }
        }
    })
}