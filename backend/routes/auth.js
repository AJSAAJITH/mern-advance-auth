const express = require('express');
const { signUp, login, logout, accountVerification, frogotPasswrod, resetPassword, checkAuth } = require('../controllers/authController');
const { isAuthenticateUser } = require('../middleware/authenticate');


const router = express.Router();
// router.get('/signup',(req, res)=>{
// res.send('this is Sign Up');
// });

router.route('/check-auth').get(isAuthenticateUser,checkAuth);

router.route('/signup').post(signUp);
router.route('/vrifyAccount').post(accountVerification);
router.route('/login').post(login);
router.route('/frogotPasswrod').post(frogotPasswrod);
router.route('/reset-password/:token').post(resetPassword);
router.route('/logout').get(logout);

module.exports = router;