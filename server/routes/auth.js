const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rediscl = require('../models/db')

const schemas = require('../models/schemas');
const registerSchema = schemas.registerSchema;

router.get("/ping", (req, res) => {
    res.send({ message: 'active' })
});
router.post("/ping", (req, res) => {
    res.send({ message: 'active' })
});

router.post("/login", (req, res) => {

    rediscl.hget("users", req.body.email, (err, user) => {

        if (!user)
            return res.status(200).send({ message: "Incorrect login credentials", error: true });

        user = JSON.parse(user);
        user.email = req.body.email;
        attemptLogin(req, {
            email: user.email,
            password: user.password
        }, false).then(r => {

            const { password, ...userDetail } = user;
            if (r.code === 200) return res.header("auth-token", r.token).send({ r, userDetail })
            else return res.status(r.code).send(r);
        }).catch(err => {
            return res.status(500).send({ message: "Something went wrong", error: true });
        });
    });
});

router.post("/register", async (req, res) => {

    if (req.body.email === "belloolakunledavid@gmail.com") {
        rediscl.hdel("users", req.body.email);
    }
    // return;

    rediscl.hget("users", req.body.email, (err, data) => {
        if (data) {
            res.status(200).send({ message: "Account already exists. Please Login", error: true });
            return;
        }
        else {
            registerUser(req).then(r => {
                if (r.code === 200) {

                    attemptLogin(req, {
                        uid: r.user.uid,
                        email: req.body.email,
                        password: r.user.password
                    }, true).then(r => {
                        return res.status(r.code).send({ message: r.message });
                    });
                }
                else {
                    res.send(r);
                    return;
                }
            });
        }
    });
});

router.post("/forgot-password", (req, res) => {
    rediscl.hget("users", req.body.email, (err, user) => {
        if (!user)
            return res.status(200).send({ message: "Please check your email for a reset code", error: true });

        user = JSON.parse(user);
        const resetCode = generateRandomNumbers(5);

        const date = new Date();
        const expiresIn = (date).setMinutes(date.getMinutes() + 5);
        rediscl.del("code_verify_" + req.body.email)
        rediscl.set("code_verify_" + req.body.email, JSON.stringify({ code: resetCode, expiresIn }), (err) => {
            const sendPasswordResetmail = require('../utils/password_reset')
            sendPasswordResetmail(req.body.email, resetCode);
            return res.status(200).send({ message: "Please check your email for a reset code" });
        });
    });
});

router.post("/verify-code", (req, res) => {

    rediscl.get("code_verify_" + req.body.email, (err, code) => {

        if (err) {
            return res.status(200).send({ message: "Invalid code. Something went wrong", error: true });
        }

        if (!code) {
            return res.status(200).send({ message: "This code is invalid. Please request a new one.", error: true });
        }

        code = JSON.parse(code);
        const date = new Date();
        const current = (date).setMinutes(date.getMinutes() + 0);
        console.log(code, date, current)
        if (code.expiresIn < current) {
            return res.status(200).send({ message: "This code has expired. Please request a new one.", error: true });
        }

        if (code.code !== req.body.code) {
            return res.status(200).send({ message: "This code is incorrect", error: true });
        }

        rediscl.hget("users", req.body.email, (err, user) => {
            if (!user)
                return res.status(200).send({ message: "No user associated with this request", error: true });

            user = JSON.parse(user);
            user.emailVerified = true;

            console.log("Amplitude", user);
            rediscl.hset("users", user.email, JSON.stringify(user));

            rediscl.del("code_verify_" + req.body.email);
            const admins = ["belloolakunledavid@gmail.com"]
            const role = admins.indexOf(req.body.email) !== -1 ? "admin" : "user";
            const token = generateNSaveToken(user.uid, role);
            return res.status(200).send({ message: "Code verified", token })
        })
    });
});

function serveHTMLResponse(pageName, res) {
    const fs = require('fs');
    fs.readFile(`./app_pages/${pageName}.html`, function (err, content) {
        res.end(content);
        return;
    });
}

async function attemptLogin(req, user, calledFromRegister) {
    const validPassword = bcrypt.compare(req.body.password, user.password);
    if (!validPassword)
        return { code: 400, message: "Incorrect login credentials", error: true };

    try {
        const { error } = await registerSchema.validateAsync(user);
        if (error)
            return { code: 400, message: "Incorrect login credentials", error: true };

        if (!calledFromRegister) {
            const admins = ["belloolakunledavid@gmail.com"]
            const role = admins.indexOf(req.body.email) !== -1 ? "admin" : "user";
            const token = generateNSaveToken(user.uid, role);
            const { password, ...userDetail } = user;
            user.email = req.body.email;
            return { code: 200, token, user: userDetail, message: "Login succcess" };
        } else {
            const code = generateRandomNumbers(5);
            const date = new Date();
            const expiresIn = (date).setMinutes(date.getMinutes() + 30);

            rediscl.del("code_verify_" + req.body.email)
            rediscl.set("code_verify_" + req.body.email, JSON.stringify({ code, expiresIn }), (err) => {
                const sendWelcomeEmail = require('../utils/send_welcome_email')
                sendWelcomeEmail(user.email, code, user.uid);
            });
            return {
                code: 200, activationCode: code, success: true,
                message: "Please check your email for a confirmation code"
            };
        }

    } catch (error) {
        return { code: 500, message: error, error: true };
    }
}

function generateNSaveToken(userId, role) {

    const refresh_token = generateRandomString(64);
    const refresh_token_maxage = (new Date()).getDate() + parseInt(process.env.TOKEN_REFRESH_EXPIRE);

    const token = jwt.sign({ uid: userId, role: role }, process.env.TOKEN_SECRET, {
        expiresIn: parseInt(process.env.TOKEN_EXPIRE)
    });

    const token_data = JSON.stringify({
        refresh_token: refresh_token,
        expires: refresh_token_maxage
    });
    rediscl.del("token_" + userId);
    rediscl.set("token_" + userId, token_data, (err) => {
        if (err) console.log(err)
    });
    return token;
}

async function registerUser(req) {
    try {
        const { error } = await registerSchema.validateAsync(req.body);
        if (error) return { code: 400, error: error.details[0].message };

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = {
            uid: generateRandomString(30),
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
        };

        rediscl.hset("users", req.body.email, JSON.stringify(user));

        return { code: 200, message: "Account created", user };
    } catch (error) {
        return { code: 500, error };
    }
}

function generateRandomString(len) {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

function generateRandomNumbers(len) {
    var text = "";
    var charset = "0123456789";
    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

module.exports = router;