document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contacto-formulario form');

  if (!form) return;

  const API_BASE_URL = (() => {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return 'https://arigatours-backend.onrender.com';
  })();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitBtn = form.querySelector('.btn-enviar');
    const btnLabel = submitBtn.querySelector('span');
    const originalText = btnLabel.textContent;

    const privacidad = form.querySelector('#privacidad');
    if (!privacidad.checked) {
      alert('Debes aceptar la política de privacidad para continuar.');
      return;
    }

    const payload = {
      nombre: form.nombre.value.trim(),
      fecha: form.fecha.value,
      telefono: form.telefono.value.trim(),
      email: form.email.value.trim(),
      mensaje: form.mensaje.value.trim(),
    };

    submitBtn.disabled = true;
    btnLabel.textContent = 'Enviando...';

    try {
      const response = await fetch(`${API_BASE_URL}/api/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la consulta');
      }

      const waText = [
        `Hola, soy ${payload.nombre}.`,
        payload.fecha   ? `Fecha estimada de viaje: ${payload.fecha}.` : '',
        payload.telefono ? `Teléfono: ${payload.telefono}.` : '',
        payload.email   ? `Email: ${payload.email}.` : '',
        payload.mensaje ? `Mensaje: ${payload.mensaje}` : '',
      ].filter(Boolean).join('\n');

      form.reset();
      window.open(`https://wa.me/817064382066?text=${encodeURIComponent(waText)}`, '_blank');
    } catch (error) {
      alert(error.message || 'No se pudo enviar la consulta. Intenta de nuevo.');
    } finally {
      submitBtn.disabled = false;
      btnLabel.textContent = originalText;
    }
  });
});
