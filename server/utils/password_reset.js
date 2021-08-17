module.exports = async (email, resetCode) => {
    try {
        const appTitle = process.env.APP_NAME;
        const projectRoot = process.env.APP_ROOT;
        const subject = appTitle + " - " + " Password Reset";
        const message = "Hi there,<br />" +
            "You requested a password change.<br /><br />" +
            `Please click the link <a href='${projectRoot}/#/update-password?c=${resetCode}'>link</a> below to confirm your account.<br />`
        "<br /><br />Team Darble";

        const sendEmail = require('./mail_helper');
        return await sendEmail(email, subject, message);
    } catch (error) {
        console.log(error)
    }
}