const {Schema, model} = require('mongoose')

const UserSchema = new Schema({
    firstName: {type: String, required: true },
    lastName: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    role: { type: String, ref: "Role" },
}, { timestamps: true })

module.exports = model('User', UserSchema)