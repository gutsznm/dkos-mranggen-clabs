const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const UserEntity = require('../domain/entities/User');
const { generateToken } = require('../../middleware/auth');
const jwt = require('jsonwebtoken');

class AuthUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register({ name, email, password, phone, adminSecretKey }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email sudah terdaftar', 400);
    }

    const role = adminSecretKey === process.env.ADMIN_SECRET_KEY ? 'admin' : 'user';

    // Hash password before storing in domain entity/repo
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userEntity = new UserEntity({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
    });

    const createdUser = await this.userRepository.create(userEntity);
    const token = generateToken(createdUser.id);

    return {
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
      token,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email dan password harus diisi', 400);
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Email atau password salah', 401);
    }

    if (!user.isActive) {
      throw new AppError('Akun Anda telah dinonaktifkan', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Email atau password salah', 401);
    }

    const token = generateToken(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  async getMe(token) {
    if (!token) {
      throw new AppError('Token tidak ditemukan', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new AppError('User tidak ditemukan', 401);
      }

      if (!user.isActive) {
        throw new AppError('Akun Anda telah dinonaktifkan', 401);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        address: user.address,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Token tidak valid', 401);
    }
  }
}

module.exports = AuthUseCase;
