import pool from '../config/db.js';

const TOUR_FIELDS = `
  id, ciudad, tematica, titulo, imagen, galeria, duracion, precio,
  punto_encuentro, descripcion, incluye, no_incluye, fechas_disponibles
`;

function formatTour(row) {
  if (!row) return null;

  return {
    id: row.id,
    ciudad: row.ciudad,
    tematica: row.tematica,
    titulo: row.titulo,
    imagen: row.imagen,
    galeria: row.galeria ?? [],
    duracion: row.duracion,
    precio: row.precio,
    puntoEncuentro: row.punto_encuentro,
    descripcion: row.descripcion,
    incluye: row.incluye ?? [],
    noIncluye: row.no_incluye ?? [],
    fechasDisponibles: row.fechas_disponibles ?? [],
  };
}

export async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tours (
      id VARCHAR(100) PRIMARY KEY,
      ciudad VARCHAR(255) NOT NULL,
      tematica VARCHAR(255) NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      imagen TEXT NOT NULL,
      galeria JSONB NOT NULL DEFAULT '[]',
      duracion VARCHAR(255) NOT NULL,
      precio VARCHAR(255) NOT NULL,
      punto_encuentro TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      incluye JSONB NOT NULL DEFAULT '[]',
      no_incluye JSONB NOT NULL DEFAULT '[]',
      fechas_disponibles JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${TOUR_FIELDS} FROM tours ORDER BY titulo ASC`
  );
  return rows.map(formatTour);
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${TOUR_FIELDS} FROM tours WHERE id = $1`,
    [id]
  );
  return formatTour(rows[0]);
}

export async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO tours (
      id, ciudad, tematica, titulo, imagen, galeria, duracion, precio,
      punto_encuentro, descripcion, incluye, no_incluye, fechas_disponibles
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING ${TOUR_FIELDS}`,
    [
      data.id,
      data.ciudad,
      data.tematica,
      data.titulo,
      data.imagen,
      JSON.stringify(data.galeria ?? []),
      data.duracion,
      data.precio,
      data.puntoEncuentro,
      data.descripcion,
      JSON.stringify(data.incluye ?? []),
      JSON.stringify(data.noIncluye ?? []),
      JSON.stringify(data.fechasDisponibles ?? []),
    ]
  );
  return formatTour(rows[0]);
}

export async function update(id, data) {
  const { rows } = await pool.query(
    `UPDATE tours SET
      ciudad = $2,
      tematica = $3,
      titulo = $4,
      imagen = $5,
      galeria = $6,
      duracion = $7,
      precio = $8,
      punto_encuentro = $9,
      descripcion = $10,
      incluye = $11,
      no_incluye = $12,
      fechas_disponibles = $13,
      updated_at = NOW()
    WHERE id = $1
    RETURNING ${TOUR_FIELDS}`,
    [
      id,
      data.ciudad,
      data.tematica,
      data.titulo,
      data.imagen,
      JSON.stringify(data.galeria ?? []),
      data.duracion,
      data.precio,
      data.puntoEncuentro,
      data.descripcion,
      JSON.stringify(data.incluye ?? []),
      JSON.stringify(data.noIncluye ?? []),
      JSON.stringify(data.fechasDisponibles ?? []),
    ]
  );
  return formatTour(rows[0]);
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM tours WHERE id = $1', [id]);
  return rowCount > 0;
}
