const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

exports.isAuthenticateUser = async (req, res, next) => {
    const { token } = req.cookies;

    // Check if the token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Login first to access this resource",
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("process.env.JWT_SECRET:", process.env.JWT_SECRET);
        // console.log("token:", token);
        const user = await User.findById(decoded.userid);
        // console.log(`decodedUserID: ${decoded.userid}`);
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in verifyToken: ", error);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};


// exports.authorizeRoles = (...roles)=>{
//     return (req, res, next)=>{
//          if(!roles.includes(req.user.role)){
//              return next(new ErrorHandler(`Role ${req.user.role} is not allowed`,401));
//          }
//          next();
//      }
//  }