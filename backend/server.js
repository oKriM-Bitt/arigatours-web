import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'ArigaTours API en funcionamiento' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contacto', contactoRoutes);

app.listen(PORT, () => {
  console.log('Servidor escuchando en http://localhost:' + PORT);
});
