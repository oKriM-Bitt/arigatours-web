/**
 * scripts/migrateTours.js
 *
 * Lee JSON/BdTours_es.json y hace un INSERT masivo en la tabla "tours"
 * de PostgreSQL. Los registros existentes con el mismo id se actualizan
 * (ON CONFLICT DO UPDATE) para que el script sea idempotente.
 *
 * Uso:  node scripts/migrateTours.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JSON_PATH = path.join(__dirname, '..', '..', 'JSON', 'BdTours_es.json');

async function migrate() {
  console.log('📂 Leyendo', JSON_PATH);
  const raw = readFileSync(JSON_PATH, 'utf-8');
  const tours = JSON.parse(raw);

  if (!Array.isArray(tours) || tours.length === 0) {
    console.error('❌ El JSON no contiene un array de tours o está vacío.');
    process.exit(1);
  }

  console.log(`🗂  ${tours.length} tours encontrados. Iniciando migración…`);

  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  try {
    await client.query('BEGIN');

    for (const tour of tours) {
      const {
        id,
        ciudad,
        tematica,
        titulo,
        imagen,
        galeria = [],
        duracion,
        precio,
        puntoEncuentro,
        descripcion,
        incluye = [],
        noIncluye = [],
        fechasDisponibles = [],
      } = tour;

      if (!id || !ciudad || !titulo || !imagen || !duracion || !precio || !descripcion) {
        console.warn(`  ⚠️  Tour omitido (campos faltantes): ${id ?? 'sin-id'}`);
        errors++;
        continue;
      }

      const result = await client.query(
        `INSERT INTO tours (
          id, ciudad, tematica, titulo, imagen, galeria, duracion, precio,
          punto_encuentro, descripcion, incluye, no_incluye, fechas_disponibles
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (id) DO UPDATE SET
          ciudad            = EXCLUDED.ciudad,
          tematica          = EXCLUDED.tematica,
          titulo            = EXCLUDED.titulo,
          imagen            = EXCLUDED.imagen,
          galeria           = EXCLUDED.galeria,
          duracion          = EXCLUDED.duracion,
          precio            = EXCLUDED.precio,
          punto_encuentro   = EXCLUDED.punto_encuentro,
          descripcion       = EXCLUDED.descripcion,
          incluye           = EXCLUDED.incluye,
          no_incluye        = EXCLUDED.no_incluye,
          fechas_disponibles = EXCLUDED.fechas_disponibles,
          updated_at        = NOW()
        RETURNING (xmax = 0) AS was_inserted`,
        [
          id,
          ciudad,
          tematica ?? '',
          titulo,
          imagen,
          JSON.stringify(galeria),
          duracion,
          precio,
          puntoEncuentro ?? '',
          descripcion,
          JSON.stringify(incluye),
          JSON.stringify(noIncluye),
          JSON.stringify(fechasDisponibles),
        ]
      );

      if (result.rows[0]?.was_inserted) {
        inserted++;
        console.log(`  ✅ Insertado:   ${id}`);
      } else {
        updated++;
        console.log(`  🔄 Actualizado: ${id}`);
      }
    }

    await client.query('COMMIT');
    console.log('\n========================================');
    console.log(`✅ Migración completada:`);
    console.log(`   Insertados : ${inserted}`);
    console.log(`   Actualizados: ${updated}`);
    console.log(`   Omitidos   : ${errors}`);
    console.log('========================================\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante la migración, se hizo ROLLBACK:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
