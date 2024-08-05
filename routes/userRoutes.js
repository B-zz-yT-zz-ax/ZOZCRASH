const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const blackjackController = require('../controllers/blackjackController');

router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/register', userController.getRegister);
router.post('/register', userController.postRegister);
router.get('/forgot-password', userController.getForgotPassword);
router.post('/forgot-password', userController.postForgotPassword);
router.get('/home', userController.getHome);
router.get('/profile', userController.getProfile);
router.get('/deposit', userController.getDeposit);
router.post('/deposit', userController.postDeposit);
router.get('/crypto-deposit', userController.getCryptoDeposit);
router.post('/crypto-deposit', userController.postCryptoDeposit);
router.post('/place-bet', userController.placeBet);
router.get('/logout', userController.logout);
router.get('/blackjack', blackjackController.getBlackjackGame);

module.exports = router;
