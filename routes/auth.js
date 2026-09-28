const express = require('express');
const { body } = require('express-validator');
const UserRepository = require('../src/adapters/repositories/UserRepository');
const AuthUseCase = require('../src/usecases/AuthUseCase');
const AuthController = require('../src/adapters/controllers/AuthController');

const userRepository = new UserRepository();
const authUseCase = new AuthUseCase(userRepository);
const authController = new AuthController(authUseCase);

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus 2-100 karakter'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password minimal 6 karakter'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Format nomor telepon tidak valid'),
  body('adminSecretKey')
    .optional()
    .custom((value) => {
      if (value && value !== process.env.ADMIN_SECRET_KEY) {
        throw new Error('Admin secret key tidak valid');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  body('password')
    .notEmpty()
    .withMessage('Password harus diisi')
];

router.post('/register', registerValidation, (req, res, next) => authController.register(req, res, next));

router.post('/login', loginValidation, (req, res, next) => authController.login(req, res, next));

router.get('/me', (req, res, next) => authController.me(req, res, next));

module.exports = router; 