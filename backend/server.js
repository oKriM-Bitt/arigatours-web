import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { testConnection } from './config/db.js';
import { findByEmail, create } from './models/Usuario.js';
import authRoutes from './routes/authRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import contactoRoutes from './routes/contactoRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ArigaTours API en funcionamiento' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contacto', contactoRoutes);

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  try {
    const existing = await findByEmail(ADMIN_EMAIL);
    if (!existing) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await create({ email: ADMIN_EMAIL, password: hashed, rol: 'admin' });
      console.log('Admin user seeded:', ADMIN_EMAIL);
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
}

async function startServer() {
  // Start HTTP server first so Render's health-check succeeds immediately
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });

  // Test DB connection and seed admin in the background
  try {
    await testConnection();
    await seedAdmin();
  } catch (error) {
    console.error('Advertencia: no se pudo conectar a la base de datos al arrancar:', error.message);
  }
}

startServer();
