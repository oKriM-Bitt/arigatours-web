import { sendContactEmail } from '../config/mailer.js';

const REQUIRED_FIELDS = ['nombre', 'fecha', 'telefono', 'email', 'mensaje'];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function enviarConsulta(req, res) {
  try {
    const { nombre, fecha, telefono, email, mensaje } = req.body;

    const missing = REQUIRED_FIELDS.filter(
      (field) => !req.body[field] || String(req.body[field]).trim() === ''
    );

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Campos obligatorios faltantes: ${missing.join(', ')}`,
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const payload = {
      nombre: nombre.trim(),
      fecha: fecha.trim(),
      telefono: telefono.trim(),
      email: email.trim().toLowerCase(),
      mensaje: mensaje.trim(),
    };

    await sendContactEmail(payload);

    res.json({ message: 'Consulta enviada correctamente. Te contactaremos pronto.' });
  } catch (error) {
    console.error('Error al enviar consulta de contacto:', error);
    res.status(500).json({ error: 'No se pudo enviar la consulta. Intenta de nuevo más tarde.' });
  }
}
