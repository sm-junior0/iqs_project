// Auth routes: login and password reset
const express = require('express');
const router = express.Router();
const { login, resetPasswordRequest, resetPasswordConfirm, signupAdmin, signupEvaluator, signupSchool, signupTrainer } = require('../controllers/authController');

// Auth routes
router.post('/login', login);
router.post('/reset', resetPasswordRequest);
router.post('/reset/confirm', resetPasswordConfirm);

// Signup routes
router.post('/signup/admin', signupAdmin);
router.post('/signup/evaluator', signupEvaluator);
router.post('/signup/school', signupSchool);
router.post('/signup/trainer', signupTrainer);

module.exports = router;
