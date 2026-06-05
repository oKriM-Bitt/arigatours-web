import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendContactEmail({ nombre, fecha, telefono, email, mensaje }) {
  const destinatario = process.env.CONTACT_EMAIL || 'bryan.arigatours@gmail.com';

  const html = `
    <h2>Nueva consulta desde ArigaTours</h2>
    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Arial,sans-serif;">
      <tr><td><strong>Nombre:</strong></td><td>${escapeHtml(nombre)}</td></tr>
      <tr><td><strong>Fecha estimada del viaje:</strong></td><td>${escapeHtml(fecha)}</td></tr>
      <tr><td><strong>Teléfono:</strong></td><td>${escapeHtml(telefono)}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td valign="top"><strong>Mensaje:</strong></td><td>${escapeHtml(mensaje).replace(/\n/g, '<br>')}</td></tr>
    </table>
  `;

  const text = [
    'Nueva consulta desde ArigaTours',
    '',
    `Nombre: ${nombre}`,
    `Fecha estimada del viaje: ${fecha}`,
    `Teléfono: ${telefono}`,
    `Email: ${email}`,
    '',
    'Mensaje:',
    mensaje,
  ].join('\n');

  await transporter.sendMail({
    from: `"ArigaTours Web" <${process.env.SMTP_USER}>`,
    to: destinatario,
    replyTo: email,
    subject: `[ArigaTours] Consulta de ${nombre}`,
    text,
    html,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
