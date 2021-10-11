module.exports = async (email) => {
    try {
        const appTitle = process.env.APP_NAME;
        const subject = "Welcome to " + appTitle;
        const message = "Hi there,<br />" +
            "Welcome to " + appTitle + ", we are very excited to have you on board.<br />" +
            "We look forward to you meeting new people and having great conversations<br />" +
            "The launch is not due for another couple of days, but we're hard at work to making " +
            "sure that we can get the final product in your hands quickly.<br />" +
            "While we get ready, please see our community guidelines <a href='https://idarble.web.app/guidelines'>here</a>" +
            "<br />We look forward to having you onboard soon." +
            "<br />In the interim, stay frosty!"
        "<br /><br />Team Darble";

        const sendEmail = require('./mail_helper');
        return await sendEmail(email, subject, message);
    } catch (error) {
        console.log(error)
    }
}