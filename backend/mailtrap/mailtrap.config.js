const nodemailer = require('nodemailer');

// Function to configure and return the transporter
const mailtrapClient = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

module.exports = mailtrapClient;
