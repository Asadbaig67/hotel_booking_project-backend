import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import QueryString from 'qs';
import User from '../models/user.js';

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
export const sendVerificationmail = async (email, otp, firstName, lastName, password, account_type) => {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

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

        let verificationObj = { email: email, otp: otp, firstName: firstName, lastName: lastName, password: password, account_type: account_type };
        console.log(verificationObj);
        // Encode the object With QueryString
        let encodedObj = encodeURIComponent(QueryString.stringify(verificationObj));
        console.log(encodedObj);
        const link = `${baseUrl}/email/verify?verifyemail=${encodedObj}`;

        const newemail = {
            body: {
                name: firstName + " " + lastName,
                intro: 'Welcome to Desalis! Thank You For Creating Account.',
                action: {
                    instructions: 'To Verify Your Email, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Confirm Account',
                        link: link
                    }
                },
                outro: 'Need help, or have questions? Just contact infoatdesalis@Desalis.com.'
            }
        };

        let mail = Mailgenerator.generate(newemail);

        let newmessage = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Confirm Account',
            html: mail
        }

        await transporter.sendMail(newmessage);
        return { status: true, message: "Email Sent Successfully" };
    } catch (error) {
        console.error(error);
        if (error.code === 'ECONNREFUSED') {
            return { status: false, message: "Failed to connect to email server" };
        } else {
            return { status: false, message: "An unknown error occurred while sending the email" };
        }
    }
};

// Send OTP Verification Link
export const sendOtpVerificationmail = async (user, email, otp) => {
    try {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

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
                name: 'OTP Verification',
                link: 'https://mailgen.js/',
            }
        });




        let verificationObj = { email: email, otp: otp };
        console.log(verificationObj);
        // Encode the object With QueryString
        let encodedObj = encodeURIComponent(QueryString.stringify(verificationObj));
        console.log(encodedObj);
        const link = `${baseUrl}/otp/verifyotp?verifyotp=${encodedObj}`;

        const newemail = {
            body: {
                name: user.firstName,
                intro: 'You will be redirected to password reset page after verfication! Thank You ',
                action: {
                    instructions: 'For Verification, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Verify Otp',
                        link: link
                    }
                },
                outro: 'Need help, or have questions? Please Contact Desalis helpline.'
            }
        };

        let mail = Mailgenerator.generate(newemail);

        let newmessage = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset Password',
            html: mail
        }

        await transporter.sendMail(newmessage);
        return { status: true, message: "Email Sent Successfully" };
    } catch (error) {
        console.error(error);
        if (error.code === 'ECONNREFUSED') {
            return { status: false, message: "Failed to connect to email server" };
        } else {
            return { status: false, message: "An unknown error occurred while sending the email" };
        }
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

// NewsLetter Email
export const newsletterEmail = async (email) => {

    try {
        let config = {
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        };
        const transporter = nodemailer.createTransport(config);
        let Mailgenerator = new Mailgen({
            theme: 'salted',
            product: {
                name: 'Desalis Hotels',
                link: 'http://localhost:3000',
            }
        });
        const newemail = {
            body: {
                name: 'Subscriber',
                intro: 'Welcome to Desalis! Thank You For Subscribing. You will get all the latest deal on you email!',
                outro: 'Need help, or have questions? Just contact us info@desalishotels.com we are always here to help you '
            }
        };

        let mail = Mailgenerator.generate(newemail);

        let newmessage = {
            from: "Desalis Hotels " + process.env.EMAIL,
            to: email,
            subject: 'NewsLetter Subscription',
            html: mail
        }
        await transporter.sendMail(newmessage);

        return { status: true, message: "Email Sent Successfully" };
    } catch (error) {
        return { status: false, message: "Internalllllllllll Server Error", error };
    }

}
