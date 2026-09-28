const User = require('../../../models/User');
const UserEntity = require('../../domain/entities/User');

class UserRepository {
  // Map Mongoose Document to Domain Entity
  _toEntity(doc) {
    if (!doc) return null;
    return new UserEntity({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      phone: doc.phone,
      role: doc.role,
      isActive: doc.isActive,
      profilePicture: doc.profilePicture,
      address: doc.address,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findByEmail(email) {
    const userDoc = await User.findOne({ email: email.toLowerCase() });
    return this._toEntity(userDoc);
  }

  async findById(id) {
    const userDoc = await User.findById(id);
    return this._toEntity(userDoc);
  }

  async create(userEntity) {
    const userDoc = new User({
      name: userEntity.name,
      email: userEntity.email,
      password: userEntity.password,
      phone: userEntity.phone,
      role: userEntity.role,
      isActive: userEntity.isActive,
      profilePicture: userEntity.profilePicture,
      address: userEntity.address,
    });

    await userDoc.save();
    return this._toEntity(userDoc);
  }

  async update(id, updateData) {
    const userDoc = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return this._toEntity(userDoc);
  }
}

module.exports = UserRepository;
