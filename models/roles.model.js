const {Schema, model} = require('mongoose')

const RolesSchema = new Schema({
    role: {type: String, unique: true, default: 'user'},
}, { timestamps: true })

module.exports = model('Roles', RolesSchema)