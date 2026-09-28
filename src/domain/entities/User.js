class UserEntity {
  constructor({
    id = null,
    name,
    email,
    password,
    phone = null,
    role = 'user',
    isActive = true,
    profilePicture = null,
    address = {},
    createdAt = null,
    updatedAt = null,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.role = role;
    this.isActive = isActive;
    this.profilePicture = profilePicture;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Pure logic can go here (e.g. check if user is admin)
  isAdmin() {
    return this.role === 'admin';
  }
}

module.exports = UserEntity;
