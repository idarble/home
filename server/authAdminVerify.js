const jwt = require('jsonwebtoken');
const rediscl = require('./models/db');
module.exports = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).send({ message: "Access denied", error: true });

    try {
        var nJwt = require('njwt');
        nJwt.verify(token, process.env.TOKEN_SECRET, function (err, verifiedJwt) {
            if (err) {

                if (err.userMessage == "Jwt is expired") {
                    console.log(err);

                    if (err.parsedBody.role !== "admin") {
                        return res.status(401).send({ message: "Insufficient priviledges", error: true });
                    }

                    rediscl.get("token_" + err.uid, (error, data) => {
                        if (error) return res.status(200).send({ message: "Invalid token", error: true });

                        const token_data = JSON.parse(data);
                        console.log(token_data);

                        if (token_data.expires > (new Date()).getDate()) {
                            console.log('Refresh has not expired')
                            generateNSaveToken(err.uid, err.role);
                            console.log('Getting here')
                            return next();
                        } else {
                            return res.status(200).send({ message: "Invalid token", error: true });
                        }
                    });
                }
                else {
                    return res.status(200).send({ message: "Invalid token", error: true });
                }

            } else {
                console.log(verifiedJwt)
                if (verifiedJwt.body.role !== "admin") {
                    return res.status(401).send({ message: "Insufficient priviledges", error: true });
                }
                req.user = verifiedJwt;
                next();
            }
        });

    } catch (error) {

        res.status(401).send({ message: "Invalid token", error: true });
    }
};

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
    rediscl.set("token_" + userId, token_data, (err) => {
        if (err) console.log(err)
    });
    return token;
}

function generateRandomString(len) {
    var text = "";
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++)
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}