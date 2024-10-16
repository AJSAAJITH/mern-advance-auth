const User = require('../models/user.model');
const generateTokenAndSetCookie = require('../utils/genarateTokenAndSetCookie');
const { sendEmail, sendWelcomeEmail, sendpasswordResetEmail, sendResetSuccessemail } = require('../mailtrap/emails');
const { VERIFICATION_EMAIL_TEMPLATE } = require('../mailtrap/emailTemplate');
const bcryptjs = require('bcryptjs');
const { json } = require('express');
const crypto = require('crypto');

// signup- http://localhost:5000/api/v1/signup
exports.signUp = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            // throw new Error("All fields are required");
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({
            email,
            password,
            name,
            verificationToken,
            verificationTokenExpireAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        });

        // jwt
        generateTokenAndSetCookie(res, 201, user);

        // Email message
        const message = typeof VERIFICATION_EMAIL_TEMPLATE === 'string'
            ? VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", user.verificationToken) : '';

        try {
            await sendEmail({
                email: user.email,
                subject: "Verification Email",
                message
            });

        } catch (error) {
            console.log("Error Sign Up", error);
            return res.json({ message: error.message });
        }

        res.status(200).json({
            success: true,
            message: "User Create Success"
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

//accont-verify - http://localhost:5000/api/v1/vrifyAccount
exports.accountVerification = async (req, res, next) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpireAt: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpireAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Verification email sent successfully",
            user,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// login - http://localhost:5000/api/v1/login
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please Enter Email & Password" });
    }
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: "Invalid Login Details" });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Login Details" });
        }

        generateTokenAndSetCookie(res, 201, user);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "User Login Successfully",
            user
        })

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

//froget passwod http://localhost:5000/api/v1/frogotPasswrod
exports.frogotPasswrod = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "user not found" });
        }

        // Genarate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExiperAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiredAt = resetTokenExiperAt;

        await user.save();

        let BASE_URL = process.env.CLIENT_URL;
        if(process.env.NODE_ENV === "production"){
            BASE_URL = `${req.protocol}://${req.get('host')}`
        } 
        const resetUrl = `${BASE_URL}/reset-password/${resetToken}`;
        // send email
        await sendpasswordResetEmail(user.email, resetUrl);

        res.status(200).json({
            success: true,
            message: "Reset Password Send Successfull"
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "email send fail"
        })
    }
}
// reset password - http://localhost:5000/api/v1//reset-password/:token
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiredAt: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expire reset token"
            });
        }

        user.password = password,
            user.resetPasswordToken = undefined,
            user.resetPasswordExpiredAt = undefined
        await user.save();

        await sendResetSuccessemail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reseted successfull",
        })


    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

// logout - http://localhost:5000/api/v1/logout
exports.logout = async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
        .status(200)
        .json({
            success: true,
            message: "Logged  out successful."
        })
};

exports.checkAuth = async (req, res, next) => {
    try {
        // Ensure req.user is not null or undefined
        if (!req.user || !req.user.id) {
            return res.status(400).json({
                success: false,
                message: "User is not authenticated",
            });
        }
        // Find user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Return user data if authenticated
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
        });
    }
};

