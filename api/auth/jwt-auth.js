var passport = require("passport");  
var passportJWT = require("passport-jwt");  
var cfg = require("../../config.js").jwt;  
var ExtractJwt = passportJWT.ExtractJwt;  
var Strategy = passportJWT.Strategy;  
var params = {  
    secretOrKey: cfg.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

module.exports = function() {  
    var strategy = new Strategy(params, function(payload, done) {
        if (payload.save) {
            return done(null, {
                user: payload.user,
                save: payload.save
            });
        } else {
            return done(new Error("Bad token"), null);
        }
    });
    passport.use(strategy);
    return {
        initialize: function() {
            return passport.initialize();
        },
        authenticate: function() {
            return passport.authenticate("jwt", cfg.session);
        }
    };
};