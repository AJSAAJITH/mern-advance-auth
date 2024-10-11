const jwt = require('jsonwebtoken');

const genarateTokenAndSetCookie = async (res, status, user) => {
    // Generate token
    const token = jwt.sign({ userid: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    // Set cookie options
    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000), // 7 days in milliseconds
        httpOnly: true,
    };

    // Send the token and response
    // set cookie
    res.cookie('token', token, options);

    return token;

};

module.exports = genarateTokenAndSetCookie;
