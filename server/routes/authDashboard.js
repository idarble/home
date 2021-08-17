const verify = require('../authVerify');
const adminVerify = require('../authAdminVerify');
const rediscl = require('../models/db');

const router = require('express').Router();

router.get("/", verify, (req, res) => {
    res.status(200).send({ message: "This route is being authenticated", user: req.user });
});

router.get("/users", adminVerify, (req, res) => {
    try {
        rediscl.hgetall("users", (err, result) => {
            return res.send(result);
        });
    } catch (e) {
        return res.send({})
    }
    return;
});

router.post("/update-user-details", verify, (req, res) => {

    rediscl.hget("users", req.body.email, (err, user) => {
        if (err) return res.status(200).send({ message: "User not found", error: true });

        user = JSON.parse(user);
        if (req.body.img) {
            user.img = req.body.img;
            user.userName = req.body.userName;
        } else {
            user.whys = req.body.why;
            user.interest = req.body.interest;
        }
        rediscl.hset("users", user.email, JSON.stringify(user));
    });
    return res.status(200).send({ error: false, message: "Updated" })
})

router.post("/verify-account", adminVerify, (req, res) => {

    rediscl.hget("users", req.body.email, (err, user) => {
        if (err) return res.status(200).send({ message: "User not found", error: true });

        user = JSON.parse(user);
        user.emailVerified = true;
        rediscl.hset("users", user.email, JSON.stringify(user));
    });
    return res.status(200).send({ error: false, message: "Updated" })
})
module.exports = router;