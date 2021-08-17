module.exports = async (email, resetCode, userId) => {
    try {
        const appTitle = process.env.APP_NAME;
        const projectRoot = process.env.APP_ROOT;
        const subject = appTitle + " - " + "Welcome, Account Verification";
        const message = "Hi there,<br />" +
            "Welcome to " + appTitle + ", we are very excited to have you on board.<br />" +
            "<br />" +
            `Please click the link <a href='${projectRoot}/#/verify-account?c=${resetCode}'>link</a> below to confirm your account.<br />`
        "<br /><br />Team Darble";

        const sendEmail = require('./mail_helper');
        return await sendEmail(email, subject, message);
    } catch (error) {
        console.log(error)
    }
}