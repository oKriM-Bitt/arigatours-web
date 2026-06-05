import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import * as Usuario from '../models/Usuario.js';
import * as Tour from '../models/Tour.js';
import * as Blog from '../models/Blog.js';

dotenv.config();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@arigatours.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const SALT_ROUNDS = 10;

async function seed() {
  try {
    await Usuario.createTable();
    await Tour.createTable();
    await Blog.createTable();
    console.log('Tablas usuarios, tours y blogs verificadas/creadas');

    const exists = await Usuario.countByEmail(ADMIN_EMAIL);

    if (exists > 0) {
      console.log(`Usuario admin ya existe: ${ADMIN_EMAIL}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

    const admin = await Usuario.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      rol: 'admin',
    });

    console.log('Usuario admin creado correctamente');
    console.log(`  Email:    ${admin.email}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Rol:      ${admin.rol}`);
  } catch (error) {
    console.error('Error en seed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
