import pool from '../config/db.js';

// Campos compartidos entre idiomas (no se traducen)
const SHARED_FIELDS = `id, imagen, galeria, fechas_disponibles`;

/**
 * Devuelve el SELECT con los campos traducibles aliaseados al nombre canónico.
 * Para ES usa las columnas base; para EN/JA usa COALESCE(col_lang, col_es)
 * como fallback si la traducción es NULL.
 */
function getLangFields(lang) {
  if (lang === 'en') {
    return `
      ${SHARED_FIELDS},
      COALESCE(ciudad_en,         ciudad)         AS ciudad,
      COALESCE(tematica_en,       tematica)       AS tematica,
      COALESCE(titulo_en,         titulo)         AS titulo,
      COALESCE(descripcion_en,    descripcion)    AS descripcion,
      COALESCE(duracion_en,       duracion)       AS duracion,
      COALESCE(precio_en,         precio)         AS precio,
      COALESCE(punto_encuentro_en, punto_encuentro) AS punto_encuentro,
      COALESCE(incluye_en,        incluye)        AS incluye,
      COALESCE(no_incluye_en,     no_incluye)     AS no_incluye
    `;
  }
  if (lang === 'ja') {
    return `
      ${SHARED_FIELDS},
      COALESCE(ciudad_ja,         ciudad)         AS ciudad,
      COALESCE(tematica_ja,       tematica)       AS tematica,
      COALESCE(titulo_ja,         titulo)         AS titulo,
      COALESCE(descripcion_ja,    descripcion)    AS descripcion,
      COALESCE(duracion_ja,       duracion)       AS duracion,
      COALESCE(precio_ja,         precio)         AS precio,
      COALESCE(punto_encuentro_ja, punto_encuentro) AS punto_encuentro,
      COALESCE(incluye_ja,        incluye)        AS incluye,
      COALESCE(no_incluye_ja,     no_incluye)     AS no_incluye
    `;
  }
  // Idioma por defecto: español (columnas base)
  return `
    ${SHARED_FIELDS},
    ciudad, tematica, titulo, descripcion, duracion, precio,
    punto_encuentro, incluye, no_incluye
  `;
}

/** Normaliza un idioma recibido por query string. Devuelve 'es', 'en' o 'ja'. */
export function normalizeLang(lang) {
  const l = (lang ?? 'es').toLowerCase();
  return ['es', 'en', 'ja'].includes(l) ? l : 'es';
}

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

export async function findAll(lang = 'es') {
  const fields = getLangFields(normalizeLang(lang));
  const { rows } = await pool.query(
    `SELECT ${fields} FROM tours ORDER BY titulo ASC`
  );
  return rows.map(formatTour);
}

export async function findById(id, lang = 'es') {
  const fields = getLangFields(normalizeLang(lang));
  const { rows } = await pool.query(
    `SELECT ${fields} FROM tours WHERE id = $1`,
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
