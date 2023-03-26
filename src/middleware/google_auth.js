import passport from 'passport';

export const googleAuthenticateCallback = () => (req, res, next) => {
    passport.authenticate("google", {
        successRedirect: 'http://localhost:3000/',
        failureRedirect: '/login/failed'
    });

}

export const googleAuthenticate = () => (req, res, next) => {

    passport.authenticate('google', { scope: ['profile', 'email'] });
    next();

}