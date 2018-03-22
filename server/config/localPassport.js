const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const User = mongoose.model('users');

//Local Strategy configuration
module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        User.findOne({
            email: email
        })
            .then(user => {
                if (!user) {
                    return done(null, false);
                };
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                })
            })
    }));
};
