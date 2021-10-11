const nodemailer = require('nodemailer');
module.exports = async (email, subject, message, bcc) => {
    var mailOptions = {
        from: process.env.MAIL_ADDRESS,
        to: email,
        subject: subject,
        html: message
    };
    if (bcc) mailOptions.bcc = bcc;

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: mailOptions.from,
            pass: process.env.MAIL_PASS
        }
    });

    return await transporter.sendMail(mailOptions, function (error, info) {
        // console.log({ error, info })
        return { error, info };
    });
}