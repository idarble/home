const verify = require('../authVerify');
const rediscl = require('../models/db');



const webpush = require('web-push');

const vapidKeys = {
    "publicKey": "BAK1vwlq4W0kU9gZgcT21JUs_Frxqd928LjgPAYLtkopJhiguHztCMnp7kyU-dFw6yhRMNHUNM8heUTJYT_0ubw",
    "privateKey": "E0hV6HRAwn26w8F4QwQikqwMbtex58e8h8qmhI10SCI"
};

webpush.setVapidDetails(
    'mailto:noreply.darble@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const router = require('express').Router();

router.get('/lessons', (req, res) => {
    res.send([
        { id: '1', description: 'Lesson Description 1', duration: '2 hours' },
        { id: '2', description: 'Lesson Description 2', duration: '1 hours' }
    ])
})


router.post('/add-sub', (req, res) => {

    console.log(req.body)
    rediscl.sadd("subs", JSON.stringify(req.body), (err, data) => {
        if (err) {
            console.log(err);
        }

        res.status(200).send({ message: "done" })
    })
})
router.post('/newsletter', sendNewsletter);
function sendNewsletter(req, res) {
    rediscl.smembers("subs", (err, data) => {
        if (err) {
            console.log(err);
        }

        var allSubscriptions = data
        console.log('Total subscriptions', allSubscriptions.length);


        const notificationPayload = {
            "notification": {
                "title": "Angular News",
                "body": "Newsletter Available!",
                "icon": "assets/main-page-logo-small-hat.png",
                "sound": "default",
                "vibrate": [100, 50, 100],
                "data": {
                    "dateOfArrival": Date.now(),
                    "primaryKey": 1
                },
                "actions": [{
                    "action": "explore",
                    "title": "Go to the site"
                }]
            }
        };

        Promise.all(allSubscriptions.map(sub => {

            sub = JSON.parse(sub);
            console.log(sub);

            webpush.sendNotification(sub, JSON.stringify(notificationPayload))
        }))
            .then(() => res.status(200).json({ message: 'Newsletter sent successfully.' }))
            .catch(err => {
                console.error("Error sending notification, reason: ", err);
                res.sendStatus(500);
            });
    })


}

module.exports = router;