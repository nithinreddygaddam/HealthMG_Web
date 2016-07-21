/**
 * Created by Nithin on 4/11/16.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    username:       {type: String, lowercase: true, unique: true},
    hash:           String,
    salt:           String,
    firstName:      {type: String, default: 'N/A'},
    lastName:       {type: String, default: 'N/A'},
    dateOfBirth:    {type: String, default: "03-23-1990"},
    gender:         {type: String, default:'Male'},
    email:          {type: String, default: 'N/A'},
    created_at: {type: Date, default_date: Date.now}
});

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.generateJWT = function() {

    // set expiration to 365 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 365);


    //use an environment variable for referencing the secret.. don't hard
    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000),
    }, 'SECRET');
};

mongoose.model('User', UserSchema);