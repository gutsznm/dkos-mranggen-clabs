const { validationResult } = require('express-validator');
const AppError = require('../../../utils/appError');

class AuthController {
  constructor(authUseCase) {
    this.authUseCase = authUseCase;
  }

  async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Data tidak valid', 400));
      }

      const { name, email, password, phone, adminSecretKey } = req.body;
      const result = await this.authUseCase.register({
        name,
        email,
        password,
        phone,
        adminSecretKey,
      });

      res.status(201).json({
        message: 'Registrasi berhasil',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Data tidak valid', 400));
      }

      const { email, password } = req.body;
      const result = await this.authUseCase.login({ email, password });

      res.json({
        message: 'Login berhasil',
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      const user = await this.authUseCase.getMe(token);
      res.json({
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
