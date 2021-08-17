module.exports = async (email, code) => {
    try {
        const appTitle = process.env.APP_NAME;
        const projectRoot = process.env.APP_ROOT;
        const subject = appTitle + " - " + " Account Verification";
        const message = "Hi there,<br />" +
            "Here's your reset link.<br />" +
            "<br />" +
            `Please click the <a href='${projectRoot}/#/verify-account?c=${code}'>link</a> to confirm your account.
            or copy ${projectRoot}/#/verify-account?c=${code} into your browser.
            <br />
            `
        "<br /><br />Team Darble";

        const sendEmail = require('./mail_helper');
        return await sendEmail(email, subject, message);
    } catch (error) {
        console.log(error);
    }
}