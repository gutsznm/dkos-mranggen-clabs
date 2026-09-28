# 📚 Dokumentasi API D'Kost Mranggen

## 🚀 Akses Dokumentasi Swagger

Setelah menjalankan server backend, Anda dapat mengakses dokumentasi API melalui:

**Development:**
```
http://localhost:5000/api-docs
```

**Production:**
```
https://dkos-mranggen-clabs-production.up.railway.app/api-docs
```

## 🔐 Authentication

### JWT Token
Semua endpoint yang memerlukan authentication menggunakan JWT Bearer Token.

**Cara mendapatkan token:**
1. Register atau Login melalui endpoint `/api/auth/register` atau `/api/auth/login`
2. Copy token dari response
3. Gunakan token di header Authorization: `Bearer <token>`

### Role-Based Access
- **User**: Akses terbatas pada data sendiri
- **Admin**: Akses penuh ke semua data dan fitur

## 📋 Kategori Endpoint

### 🔑 Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### 👤 User Operations
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/profile/password` - Change password
- `GET /api/user/bookings` - Get user bookings
- `GET /api/user/kost` - Get available kosts

### 🏢 Kost Management
- `GET /api/kost` - Get all kosts (public)
- `GET /api/kost/{id}` - Get kost by ID (public)
- `POST /api/kost` - Create new kost (admin only)
- `PUT /api/kost/{id}` - Update kost (admin only)
- `DELETE /api/kost/{id}` - Delete kost (admin only)
- `GET /api/kost/type/{roomType}` - Get kosts by room type

### 📸 Gallery Management
- `GET /api/gallery` - Get all gallery items (public)
- `GET /api/gallery/{id}` - Get gallery item by ID (public)
- `POST /api/gallery` - Upload single media (admin only)
- `POST /api/gallery/multiple` - Upload multiple media (admin only)
- `PUT /api/gallery/{id}` - Update gallery item (admin only)
- `DELETE /api/gallery/{id}` - Delete gallery item (admin only)

### 📅 Booking System
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/{id}` - Get booking by ID
- `PUT /api/bookings/{id}/cancel` - Cancel booking
- `POST /api/bookings/payments/{bookingId}/proof` - Upload payment proof
- `GET /api/bookings/statistics` - Get booking statistics (admin only)

### 💰 Payment Management
- `POST /api/payments/{bookingId}/proof` - Upload payment proof
- `PUT /api/payments/{bookingId}/verify` - Verify payment (admin only)
- `POST /api/payments/{bookingId}/verify` - Verify payment POST method (admin only)
- `PUT /api/payments/{bookingId}/reject` - Reject payment (admin only)
- `GET /api/payments/statistics` - Get payment statistics (admin only)

### 👨‍💼 Admin Operations
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{userId}` - Get user by ID
- `PUT /api/admin/users/{userId}` - Update user
- `GET /api/admin/kosts` - Get all kosts
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/{bookingId}/approve` - Approve booking
- `PUT /api/admin/bookings/{bookingId}/reject` - Reject booking
- `GET /api/admin/gallery` - Get gallery items
- `GET /api/admin/dashboard` - Get dashboard statistics

## 📊 Data Models

### User
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "user|admin",
  "isActive": "boolean",
  "profilePicture": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Kost
```json
{
  "_id": "string",
  "name": "string",
  "address": "string",
  "description": "string",
  "roomType": "A|B",
  "price": "number",
  "totalRooms": "number",
  "availableRooms": "number",
  "facilities": ["string"],
  "rules": ["string"],
  "images": ["string"],
  "status": "available|full|maintenance",
  "createdBy": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Booking
```json
{
  "_id": "string",
  "user": "string",
  "kost": "string",
  "startDate": "date",
  "endDate": "date",
  "duration": "number",
  "totalAmount": "number",
  "status": "pending|approved|rejected|active|completed|cancelled",
  "paymentStatus": "unpaid|paid|verified",
  "paymentProof": "string",
  "notes": "string",
  "adminNotes": "string",
  "approvedBy": "string",
  "approvedAt": "date",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Gallery
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "mediaUrl": "string",
  "mediaType": "image|video",
  "kostId": "string",
  "uploadedBy": "string",
  "isActive": "boolean",
  "order": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## 🔧 Cara Menggunakan Swagger UI

### 1. **Akses Dokumentasi**
Buka browser dan kunjungi `http://localhost:5000/api-docs`

### 2. **Authentication**
1. Klik tombol **"Authorize"** di bagian atas
2. Masukkan token dalam format: `Bearer <your_jwt_token>`
3. Klik **"Authorize"**

### 3. **Testing Endpoint**
1. Pilih endpoint yang ingin ditest
2. Klik **"Try it out"**
3. Isi parameter yang diperlukan
4. Klik **"Execute"**

### 4. **Response**
- Response akan ditampilkan dengan format JSON
- Status code dan response time juga ditampilkan
- Error messages akan muncul jika ada kesalahan

## 🛠️ Fitur Swagger UI

### ✅ **Available Features:**
- **Interactive Documentation** - Test API langsung dari browser
- **Request/Response Examples** - Contoh data yang diperlukan
- **Authentication Support** - JWT Bearer token
- **Parameter Validation** - Validasi input otomatis
- **Response Schema** - Struktur response yang jelas
- **Error Handling** - Dokumentasi error yang mungkin terjadi
- **Filter & Search** - Cari endpoint dengan mudah
- **Export Options** - Export dokumentasi ke berbagai format

### 🎨 **Customization:**
- Custom CSS untuk branding
- Custom title dan favicon
- Persistent authorization
- Request duration display
- Filter dan search functionality

## 📝 Contoh Penggunaan

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "081234567890"
}
```

### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Booking (dengan token)
```bash
POST /api/bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "kostId": "kost_id_here",
  "startDate": "2024-01-01",
  "duration": 6,
  "notes": "Booking untuk semester depan"
}
```

## 🔒 Security Features

### Rate Limiting
- 100 requests per 15 minutes per IP
- Mencegah abuse dan DDoS

### Input Validation
- Express-validator untuk semua input
- Sanitasi data otomatis
- Custom validation rules

### CORS Protection
- Cross-origin resource sharing
- Configurable allowed origins
- Credentials support

### Helmet Security
- Security headers
- XSS protection
- Content Security Policy

## 🚨 Error Handling

### Common Error Codes:
- `400` - Bad Request (data tidak valid)
- `401` - Unauthorized (token tidak valid)
- `403` - Forbidden (tidak memiliki akses)
- `404` - Not Found (resource tidak ditemukan)
- `500` - Internal Server Error

### Error Response Format:
```json
{
  "message": "Pesan error dalam bahasa Indonesia",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ]
}
```

## 📞 Support

Jika ada pertanyaan atau masalah dengan API:

- **Email**: dmranggenkost@gmail.com
- **Documentation**: `/api-docs`
- **Health Check**: `/api/health`

---

**D'Kost Mranggen API v1.0.0** 🏠 