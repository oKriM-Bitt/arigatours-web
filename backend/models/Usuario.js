import pool from '../config/db.js';

export async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      rol VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email)
  `);
}

export async function findByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id, email, password, rol FROM usuarios WHERE email = $1',
    [email]
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, email, rol FROM usuarios WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ email, password, rol = 'user' }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (email, password, rol)
     VALUES ($1, $2, $3)
     RETURNING id, email, rol`,
    [email, password, rol]
  );
  return rows[0];
}

export async function countByEmail(email) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM usuarios WHERE email = $1',
    [email]
  );
  return rows[0].total;
}
