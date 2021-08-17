const router = require('express').Router();
const fetch = require("isomorphic-fetch");

router.post("/verify-captcha", (req, res) => {

    const response_key = req.body["g-recaptcha-response"];
    const secret_key = process.env.RECAPTCHA_SECRET;
    const url =
        `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

    fetch(url, {
        method: "post",
    })
        .then((response) => response.json())
        .then((google_response) => {

            // google_response is the object return by
            // google as a response 
            if (google_response.success == true) {
                //   if captcha is verified
                return res.send({ response: "Successful" });
            } else {
                // if captcha is not verified
                return res.send({ response: "Failed" });
            }
        })
        .catch((error) => {
            // Some error while verify captcha
            return res.json({ error });
        });
});

router.post("/send-waiting-list-message", (req, res) => {

    const sendWelcomeEmail = require('../utils/waiting_list_message')
    sendWelcomeEmail(req.body.email);
})

module.exports = router;