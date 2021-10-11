const verify = require('../authVerify');
const rediscl = require('../models/db');

const router = require('express').Router();

router.post("/save-payment", verify, (req, res) => {
    const { paymentObj } = req.body;
    rediscl.sadd("payments", paymentObj, (err, data) => {
        if (err) {
            console.log(err);
        }

        res.status(200).send({ message: "Payment response saved" })
    })
});

router.get("/payments", verify, (req, res) => {
    rediscl.smembers("payments", (err, data) => {
        if (err) {
            console.log(err);
        }

        try { data = JSON.parse(data); } catch { }
        res.status(200).send(data)
    })
});

router.post("/flutter-subscriptions", verify, (req, res) => {
    const request = require('request');

    const from = new Date();
    const to = new Date();
    from.setDate(to.getDate() - 30);

    let query = "?";
    if (from) query += "subscribed_from=" + formatDate(from);
    if (to)
        query += (query == "?" ? "" : "&") + ("subscribed_to=" + formatDate(to));
    if (req.body.email) query += (query == "?" ? "" : "&") + ("email=" + req.body.email);

    const options = {
        'method': 'GET',
        'url': `${process.env.FLUTTER_BASE_API_URL}/subscriptions${query}`,
        'headers': {
            'Authorization': `Bearer ${process.env.FLUTTER_TEST_SEC_KEY}`
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        res.status(200).send({ response: response.body });
    });
});

router.post("/verify-transaction", (req, res) => {
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': `${process.env.FLUTTER_BASE_API_URL}/transactions/${req.body.transaction_id}/verify`,
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLUTTER_LIVE_SEC_KEY}`
        },
    };
    request(options, function (error, response) {
        if (error) {
            console.log(error)
        }
        return res.status(200).send({ response: response.body });
    });
});

router.post("/verify-transaction-1", (req, res) => {
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': `${process.env.FLUTTER_BASE_TEST_API_URL}/transactions/${req.body.tx_ref}/verify`,
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLUTTER_TEST_SEC_KEY}`
        },
    };
    request(options, function (error, response) {
        if (error) {
            console.log(error)
        }
        return res.status(200).send({ response: response.body });
    });
});

function formatDate(date) {
    try {
        const mt = date.getMonth() + 1;
        const dy = date.getDate();
        return `${date.getFullYear()}-${mt > 9 ? mt : "0" + mt}-${dy > 9 ? dy : "0" + dy
            }`;
    } catch { return ''; }
}

module.exports = router;