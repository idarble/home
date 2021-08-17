const redis = require('redis')
var rediscl = redis.createClient({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS
});

rediscl.on("connect", function () {
    console.log("DB on");
});

module.exports = rediscl;