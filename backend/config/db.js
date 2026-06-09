/**
 * config/db.js -- STUB SIN BASE DE DATOS
 *
 * Neon esta desconectado. Este modulo exporta un pool inerte para que todos
 * los imports existentes carguen sin errores y el servidor arranque limpio.
 * Cualquier llamada a pool.query() en runtime recibira un error claro.
 *
 * Para reconectar a Neon: restaurar la version original con pg.Pool.
 */

const DB_OFFLINE = new Error(
  '[db] Base de datos no disponible -- el backend esta en modo JSON local.'
);

// Pool stub: misma interfaz que pg.Pool pero sin red
const pool = {
  query:   () => Promise.reject(DB_OFFLINE),
  connect: () => Promise.reject(DB_OFFLINE),
  on:      () => {},
  end:     () => Promise.resolve(),
};

// No-op: server.js la llama en el arranque
export async function testConnection() {
  console.log('[db] Modo sin BD activo -- testConnection omitida.');
}

export default pool;
