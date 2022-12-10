const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalPassport = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalPassport);

module.exports = mongoose.model('User', UserSchema);
