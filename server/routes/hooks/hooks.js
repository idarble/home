const verify = require('../../authVerify');
const rediscl = require('../../models/db');

const router = require('express').Router();

router.post("/", verify, (req, res) => {

    switch (req.body.type) {
        case "getAll":
            return getAll(res);
        case "get":
            return get(req.body.id, res);
        case "create":
            return create(req.body.hook, res);
        case "update":
            return update(req, res);
        case "delete":
            return remove(req.body.id, res)
    }
});

function update(req, res) {
    try {
        rediscl.hget("hooks", req.body.id, (err, hook) => {
            if (err) {
                console.log(err);
                return res.send({ error: true });
            }

            hook = JSON.parse(hook);
            hook.hook = req.body.updateObject.hook;
            hook.date = req.body.updateObject.date;
            return create(hook, res);
        });
    } catch (e) {

    }
}

function getAll(res) {
    try {
        rediscl.hscan("hooks", 0, (err, result) => {
            console.log(result)
            if (err) {
                console.log(err, result);
                return res.send({ error: true });
            }
            return res.send(result);
        });
    } catch (e) {

    }
}

function get(id, res) {
    try {
        rediscl.hget("hooks", id, (err, result) => {
            if (err) {
                console.log(err, result);
                return res.send({ error: true });
            }
            return res.send(result);
        });
    } catch (e) {

    }
}

function create(hook, res) {
    console.log(hook)
    rediscl.hset("hooks", hook.id, JSON.stringify(hook), (err, result) => {
        if (err) {
            console.log(err);
            return res.send({ error: true });
        }
        return res.send({ done: true });
    });
}

function remove(id, res) {
    rediscl.hdel("hooks", id, (err, result) => {
        if (err) {
            console.log(err);
            return res.send({ error: true });
        }
        return res.send({ done: true });
    });
}

module.exports = router;