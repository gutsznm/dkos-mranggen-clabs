# D'Kost Mranggen Backend Service

Backend API untuk aplikasi manajemen kost D'Kost Mranggen.

## Fitur

- **Authentication**: Login, register, dan manajemen user
- **Kost Management**: CRUD operasi untuk data kost
- **Booking System**: Sistem pemesanan dan booking kamar
- **Payment System**: Manajemen pembayaran dan verifikasi
- **Gallery Management**: Upload dan manajemen gambar kost
- **Admin Dashboard**: Panel admin untuk manajemen sistem
- **User Dashboard**: Panel user untuk melihat booking dan profil

## Teknologi

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM untuk MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File upload
- **express-validator** - Input validation
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

## Instalasi

1. Clone repository
```bash
git clone <repository-url>
cd dkost-service
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp env.example .env
```

4. Edit file `.env` dengan konfigurasi yang sesuai:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/dkost_mranggen

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Configuration
ADMIN_SECRET_KEY=dkost_admin_secret_2024

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

5. Jalankan server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### User Routes
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/profile/password` - Change password
- `GET /api/user/bookings` - Get user's bookings
- `GET /api/user/bookings/active` - Get active booking
- `GET /api/user/kost` - Get available kosts
- `GET /api/user/kost/:roomType` - Get kosts by room type

### Admin Routes
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user by ID
- `PUT /api/admin/users/:userId` - Update user
- `GET /api/admin/kosts` - Get all kosts
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:bookingId/approve` - Approve booking
- `PUT /api/admin/bookings/:bookingId/reject` - Reject booking
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Kost Routes
- `GET /api/kost` - Get all kosts (public)
- `GET /api/kost/:id` - Get kost by ID (public)
- `POST /api/kost` - Create new kost (admin)
- `PUT /api/kost/:id` - Update kost (admin)
- `DELETE /api/kost/:id` - Delete kost (admin)
- `GET /api/kost/type/:roomType` - Get kosts by room type

### Gallery Routes
- `GET /api/gallery` - Get all gallery items (public)
- `GET /api/gallery/:id` - Get gallery by ID (public)
- `POST /api/gallery` - Upload single media (admin)
- `POST /api/gallery/multiple` - Upload multiple media (admin)
- `PUT /api/gallery/:id` - Update gallery item (admin)
- `DELETE /api/gallery/:id` - Delete gallery item (admin)
- `GET /api/gallery/kost/:kostId` - Get gallery by kost ID

### Booking Routes
- `POST /api/bookings` - Create booking (user)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/cancel` - Cancel booking (user)
- `PUT /api/bookings/:id/payment-proof` - Upload payment proof (user)
- `GET /api/bookings/stats/overview` - Get booking statistics (admin)

### Payment Routes
- `POST /api/payments/:bookingId/proof` - Upload payment proof (user)
- `PUT /api/payments/:bookingId/verify` - Verify payment (admin)
- `PUT /api/payments/:bookingId/reject` - Reject payment (admin)
- `GET /api/payments/stats` - Get payment statistics (admin)
- `GET /api/payments/by-status/:status` - Get payments by status (admin)

## Database Models

### User
- name, email, password, phone, role, isActive, profilePicture, address

### Kost
- name, address, description, roomType, price, totalRooms, availableRooms, facilities, rules, images, status, location, nearbyPlaces

### Booking
- user, kost, startDate, endDate, duration, totalAmount, status, paymentStatus, paymentProof, notes, adminNotes, approvedBy, approvedAt

### Gallery
- title, description, mediaUrl, mediaType, kostId, uploadedBy, isActive, order

## Authentication

API menggunakan JWT (JSON Web Token) untuk authentication. Token harus disertakan di header Authorization:

```
Authorization: Bearer <token>
```

## File Upload

Untuk upload file (gambar), gunakan multipart/form-data dengan field `media`.

## Error Handling

API mengembalikan response dengan format:
```json
{
  "message": "Pesan error",
  "errors": [] // untuk validation errors
}
```

## Security Features

- Password hashing dengan bcrypt
- JWT token authentication
- Input validation dengan express-validator
- Rate limiting
- CORS protection
- Helmet security headers

## Development

Untuk development, gunakan:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000` dengan hot reload.

## Production

Untuk production, gunakan:
```bash
npm start
```

Pastikan environment variables sudah dikonfigurasi dengan benar untuk production.

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License 