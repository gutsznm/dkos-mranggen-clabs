const AuthUseCase = require('../src/usecases/AuthUseCase');
const AppError = require('../utils/appError');

describe('AuthUseCase', () => {
  let mockUserRepository;
  let authUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    authUseCase = new AuthUseCase(mockUserRepository);
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.ADMIN_SECRET_KEY = 'adminsecret';
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '08123456789',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user123',
        name: userData.name,
        email: userData.email,
        role: 'user',
      });

      const result = await authUseCase.register(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result.user).toEqual({
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
      });
    });

    it('should throw an error if email is already registered', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(authUseCase.register(userData)).rejects.toThrow(
        new AppError('Email sudah terdaftar', 400)
      );
    });
  });

  describe('login', () => {
    it('should throw error if email or password is not provided', async () => {
      await expect(authUseCase.login({ email: '' })).rejects.toThrow(
        new AppError('Email dan password harus diisi', 400)
      );
    });
  });
});
