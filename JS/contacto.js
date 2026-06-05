document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contacto-formulario form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const privacidad = form.querySelector('#privacidad');
    if (!privacidad.checked) {
      alert('Debes aceptar la política de privacidad para continuar.');
      return;
    }

    const nombre   = form.nombre.value.trim();
    const fecha    = form.fecha.value;
    const telefono = form.telefono.value.trim();
    const email    = form.email.value.trim();
    const mensaje  = form.mensaje.value.trim();

    const waText = [
      `Hola, soy ${nombre}.`,
      fecha    ? `Fecha estimada de viaje: ${fecha}.` : '',
      telefono ? `Teléfono: ${telefono}.` : '',
      email    ? `Email: ${email}.` : '',
      mensaje  ? `Mensaje: ${mensaje}` : '',
    ].filter(Boolean).join('\n');

    form.reset();
    window.open(`https://wa.me/817064382066?text=${encodeURIComponent(waText)}`, '_blank');
  });
});
