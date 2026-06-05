import pool from '../config/db.js';

const BLOG_FIELDS = `
  id, categoria, titulo, autor, fecha, imagen, resumen, contenido
`;

function formatBlog(row) {
  if (!row) return null;

  return {
    id: row.id,
    categoria: row.categoria,
    titulo: row.titulo,
    autor: row.autor,
    fecha: row.fecha,
    imagen: row.imagen,
    resumen: row.resumen,
    contenido: row.contenido,
  };
}

export async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id VARCHAR(100) PRIMARY KEY,
      categoria VARCHAR(255) NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      autor VARCHAR(255) NOT NULL,
      fecha VARCHAR(100) NOT NULL,
      imagen TEXT NOT NULL,
      resumen TEXT NOT NULL,
      contenido TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${BLOG_FIELDS} FROM blogs ORDER BY created_at DESC`
  );
  return rows.map(formatBlog);
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${BLOG_FIELDS} FROM blogs WHERE id = $1`,
    [id]
  );
  return formatBlog(rows[0]);
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO blogs (id, categoria, titulo, autor, fecha, imagen, resumen, contenido)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING ${BLOG_FIELDS}`,
    [
      data.id,
      data.categoria,
      data.titulo,
      data.autor,
      data.fecha,
      data.imagen,
      data.resumen,
      data.contenido,
    ]
  );
  return formatBlog(rows[0]);
}

export async function update(id, data) {
  const { rows } = await pool.query(
    `UPDATE blogs SET
      categoria = $2,
      titulo = $3,
      autor = $4,
      fecha = $5,
      imagen = $6,
      resumen = $7,
      contenido = $8,
      updated_at = NOW()
    WHERE id = $1
    RETURNING ${BLOG_FIELDS}`,
    [
      id,
      data.categoria,
      data.titulo,
      data.autor,
      data.fecha,
      data.imagen,
      data.resumen,
      data.contenido,
    ]
  );
  return formatBlog(rows[0]);
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM blogs WHERE id = $1', [id]);
  return rowCount > 0;
}
