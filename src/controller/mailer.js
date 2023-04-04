import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import QueryString from 'qs';

// Send Demo Email
export const sendmail = async (req, res) => {
    try {
        const { email } = req.body;
        let config = {
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        };
        const transporter = nodemailer.createTransport(config);

        let Mailgenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Nodejs Developer',
                link: 'https://mailgen.js/',
            }
        });

        const newemail = {
            body: {
                name: 'Hassaan Ahmed',
                intro: 'Welcome to Desalis! Thank You For Creating Account.',
                action: {
                    instructions: 'To Verify Your Email, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Confirm Account',
                        link: 'desalis.netlify.app'
                    }
                },
                outro: 'Need help, or have questions? Just contact Asad(Backend Developer).'
            }
        };

        let mail = Mailgenerator.generate(newemail);

        let newmessage = {
            from: "Backend Developer " + process.env.EMAIL,
            to: email,
            subject: 'Confirm Account',
            html: mail
        }

        transporter.sendMail(newmessage, (err, info) => {
            if (err) {
                res.status(500).json({
                    message: "Internal Server Error",
                });
            } else {
                res.status(200).json({
                    message: "Email Sent Successfully",
                });
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

// Send Email Verification Link
export const sendVerificationmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        let config = {
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        };
        const transporter = nodemailer.createTransport(config);

        let Mailgenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Email Verification',
                link: 'https://mailgen.js/',
            }
        });

        let verificationObj = { email: email, otp: otp };
        console.log(verificationObj);
        // Encode the object With QueryString
        let encodedObj = encodeURIComponent(QueryString.stringify(verificationObj));
        console.log(encodedObj);
        const link = `http://localhost:5000/email/verify?verifyemail=${encodedObj}`;

        const newemail = {
            body: {
                name: 'Hassaan Ahmed',
                intro: 'Welcome to Desalis! Thank You For Creating Account.',
                action: {
                    instructions: 'To Verify Your Email, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Confirm Account',
                        link: link
                    }
                },
                outro: 'Need help, or have questions? Just contact Asad(Backend Developer).'
            }
        };

        let mail = Mailgenerator.generate(newemail);

        let newmessage = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Confirm Account',
            html: mail
        }

        transporter.sendMail(newmessage, (err, info) => {
            if (err) {
                res.status(500).json({
                    message: "Internal Server Error",
                });
            } else {
                res.status(200).json({
                    message: "Email Sent Successfully",
                });
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


// Send OTP For Password Reset
export const sendotp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        let config = {
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        };
        const transporter = nodemailer.createTransport(config);

        let Mailgenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Password Reset',
                link: 'https://mailgen.js/',
            }
        });

        const newemail = {
            body: {
                name: 'Hassaan Ahmed',
                intro: `Your OTP Verification code is: ${otp}`,
            }
        };

        let mail = Mailgenerator.generate(newemail);

        let newmessage = {
            from: process.env.EMAIL,
            to: email,
            subject: 'OPT Verification',
            html: mail
        }

        transporter.sendMail(newmessage, (err, info) => {
            if (err) {
                res.status(500).json({
                    message: "Internal Server Error",
                    error: err
                });
            } else {
                res.status(200).json({
                    message: "Email Sent Successfully",
                });
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error
        });
    }
};