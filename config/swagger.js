const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'D\'Kost Mranggen API',
      version: '1.0.0',
      description: 'API Documentation untuk sistem manajemen kost D\'Kost Mranggen',
      contact: {
        name: 'D\'Kost Mranggen',
        email: 'dmranggenkost@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://dkos-mranggen-clabs-production.up.railway.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token untuk authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'Nama user'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email user'
            },
            phone: {
              type: 'string',
              description: 'Nomor telepon'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'Role user'
            },
            isActive: {
              type: 'boolean',
              description: 'Status aktif user'
            },
            profilePicture: {
              type: 'string',
              description: 'URL foto profil'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Kost: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Kost ID'
            },
            name: {
              type: 'string',
              description: 'Nama kost'
            },
            address: {
              type: 'string',
              description: 'Alamat kost'
            },
            description: {
              type: 'string',
              description: 'Deskripsi kost'
            },
            roomType: {
              type: 'string',
              enum: ['A', 'B'],
              description: 'Tipe kamar'
            },
            price: {
              type: 'number',
              description: 'Harga per bulan'
            },
            totalRooms: {
              type: 'number',
              description: 'Total kamar'
            },
            availableRooms: {
              type: 'number',
              description: 'Kamar tersedia'
            },
            facilities: {
              type: 'array',
              items: { type: 'string' },
              description: 'Daftar fasilitas'
            },
            rules: {
              type: 'array',
              items: { type: 'string' },
              description: 'Daftar peraturan'
            },
            images: {
              type: 'array',
              items: { type: 'string' },
              description: 'Daftar URL gambar'
            },
            status: {
              type: 'string',
              enum: ['available', 'full', 'maintenance'],
              description: 'Status kost'
            },
            createdBy: {
              type: 'string',
              description: 'ID user yang membuat'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Booking ID'
            },
            user: {
              type: 'string',
              description: 'ID user'
            },
            kost: {
              type: 'string',
              description: 'ID kost'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Tanggal mulai sewa'
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Tanggal selesai sewa'
            },
            duration: {
              type: 'number',
              description: 'Durasi sewa (bulan)'
            },
            totalAmount: {
              type: 'number',
              description: 'Total biaya'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
              description: 'Status booking'
            },
            paymentStatus: {
              type: 'string',
              enum: ['unpaid', 'paid', 'verified'],
              description: 'Status pembayaran'
            },
            paymentProof: {
              type: 'string',
              description: 'URL bukti pembayaran'
            },
            notes: {
              type: 'string',
              description: 'Catatan user'
            },
            adminNotes: {
              type: 'string',
              description: 'Catatan admin'
            },
            approvedBy: {
              type: 'string',
              description: 'ID admin yang menyetujui'
            },
            approvedAt: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Gallery: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Gallery ID'
            },
            title: {
              type: 'string',
              description: 'Judul media'
            },
            description: {
              type: 'string',
              description: 'Deskripsi media'
            },
            mediaUrl: {
              type: 'string',
              description: 'URL media'
            },
            mediaType: {
              type: 'string',
              enum: ['image', 'video'],
              description: 'Tipe media'
            },
            kostId: {
              type: 'string',
              description: 'ID kost'
            },
            uploadedBy: {
              type: 'string',
              description: 'ID user yang upload'
            },
            isActive: {
              type: 'boolean',
              description: 'Status aktif'
            },
            order: {
              type: 'number',
              description: 'Urutan tampilan'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Pesan error'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              },
              description: 'Detail error validasi'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Pesan sukses'
            },
            data: {
              type: 'object',
              description: 'Data response'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoint untuk login, register, dan manajemen user'
      },
      {
        name: 'User',
        description: 'Endpoint untuk operasi user (profile, booking, dll)'
      },
      {
        name: 'Admin',
        description: 'Endpoint untuk operasi admin (manajemen sistem)'
      },
      {
        name: 'Kost',
        description: 'Endpoint untuk manajemen data kost'
      },
      {
        name: 'Gallery',
        description: 'Endpoint untuk manajemen gallery dan media'
      },
      {
        name: 'Booking',
        description: 'Endpoint untuk sistem booking dan pemesanan'
      },
      {
        name: 'Payment',
        description: 'Endpoint untuk manajemen pembayaran'
      }
    ]
  },
  apis: [
    './docs/*.yaml',
    './routes/*.js',
    './models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs; 