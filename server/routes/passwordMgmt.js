const verify = require('../authVerify')

const bcrypt = require('bcryptjs');
const router = require('express').Router();

const rediscl = require('../models/db')
const schemas = require('../models/schemas');
const passwordChangeSchema = schemas.passwordChangeSchema;

router.post("/update-password", verify, async (req, res) => {
    rediscl.hget("users", req.body.email, async (err, user) => {
        if (err || !user) {
            return res.status(200).send({ code: 200, message: "Invalid user email", error: true });
        }

        console.log(err, user)

        try {
            const { error } = await passwordChangeSchema.validateAsync({
                password: req.body.password
            });
            if (error)
                return res.status(200).send({
                    code: 200, message:
                        "The password is invalid. Password complexity", error: true
                });

            console.log(err, user, error)
        } catch (e) {
            console.log(e)
        }


        user = JSON.parse(user);

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (validPassword === true)
            return res.status(200).send({ message: "You cannot use the same password as before", error: true });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        console.log(salt, hashedPassword);

        user.password = hashedPassword;
        rediscl.hset("users", user.email, JSON.stringify(user), (err, res) => {
            console.log("Save res", err, res);
        });
        return res.status(200).send({ message: "Password change successful" })
    });
});

router.post("/resend-code", verify, async (req, res) => {

    rediscl.hget("users", req.body.email, async (err, user) => {
        if (err || !user)
            return res.status(404).send({ message: "Invalid request #1", error: true });

        user = JSON.parse(user);
        console.log("User", user)

        const code = generateRandomNumbers(5);
        const date = new Date();
        const expiresIn = (date).setMinutes(date.getMinutes() + 10);

        rediscl.del("code_verify_" + req.body.email)
        rediscl.set("code_verify_" + req.body.email, JSON.stringify({ code, expiresIn }), async (err) => {
            console.log("Error adding token", err);

            const authCodeResend = require('../utils/auth_code_resend')
            await authCodeResend(req.body.email, code);

            return res.status(200).send({ message: "Email sent" })
        });
    });
});

// async function updatePassword(user, req, res) {
//     const validPassword = await bcrypt.compare(req.body.password, user.password);
//     if (validPassword === true)
//         return res.status(200).send({ code: 400, message: "You cannot use the same password as before", error: true });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);

//     user.password = hashedPassword;
//     rediscl.hset("users", user.email, JSON.stringify(user));
//     return res.status(200).send({ message: "Password change successful" })
// }

function generateRandomNumbers(len) {
    var text = "";
    var charset = "0123456789";
    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

module.exports = router;