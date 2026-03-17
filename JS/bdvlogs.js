let todosLosVlogs = [];



document.addEventListener('DOMContentLoaded', () => {
    // Cargar el JSON de Vlogs
    fetch('../JSON/BdVlogs.json')
        .then(respuesta => respuesta.json())
        .then(datos => {
            todosLosVlogs = datos;
            renderizarVlogs(todosLosVlogs);
        })
        .catch(error => console.error("Error cargando los Vlogs:", error));

    // Elementos del DOM para los filtros
    const inputBuscador = document.getElementById('buscador-vlogs');
    const filtroCategoria = document.getElementById('filtro-categoria');

    // Función que filtra por categoría y por texto al mismo tiempo
    function aplicarFiltrosVlogs() {
        const textoBusqueda = inputBuscador.value.toLowerCase();
        const categoria = filtroCategoria.value;

        const vlogsFiltrados = todosLosVlogs.filter(vlog => {
            const coincideCategoria = categoria === 'todas' || vlog.categoria === categoria;
            const coincideTexto = vlog.titulo.toLowerCase().includes(textoBusqueda) || 
                                  vlog.contenido.toLowerCase().includes(textoBusqueda);
            
            return coincideCategoria && coincideTexto;
        });

        renderizarVlogs(vlogsFiltrados);
    }

    // Escuchamos cuando el usuario escribe o cambia el select
    inputBuscador.addEventListener('keyup', aplicarFiltrosVlogs);
    filtroCategoria.addEventListener('change', aplicarFiltrosVlogs);
});

// Dibujar las tarjetas de Blog
function renderizarVlogs(vlogs) {
    const contenedor = document.getElementById('contenedor-vlogs');
    contenedor.innerHTML = '';

    if (vlogs.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; width:100%;">No se encontraron artículos con esa búsqueda.</p>';
        return;
    }

    vlogs.forEach(vlog => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tour-card vlog-card'; // Reutilizamos la clase de tours para mantener el estilo
        tarjeta.innerHTML = `
            <img src="${vlog.imagen}" alt="${vlog.titulo}">
            <div class="tour-card-info">
                <span class="badge-tematica">${vlog.categoria}</span>
                <h3 style="font-size: 1.2rem;">${vlog.titulo}</h3>
                <p style="font-size: 0.85rem; color: #888; margin-bottom: 0.5rem;"><i class="far fa-calendar-alt"></i> ${vlog.fecha} | <i class="fas fa-user-edit"></i> ${vlog.autor}</p>
                <p style="color: #555; font-size: 0.95rem;">${vlog.resumen}</p>
            </div>
        `;

        tarjeta.addEventListener('click', () => {
            document.querySelectorAll('.vlog-card').forEach(c => c.classList.remove('active-card'));
            tarjeta.classList.add('active-card');
            leerArticulo(vlog);
        });

        contenedor.appendChild(tarjeta);
    });
}

// Mostrar el artículo completo abajo
function leerArticulo(vlog) {
    document.getElementById('mensaje-default-vlog').style.display = 'none';
    const contenedorArticulo = document.getElementById('articulo-dinamico');

    contenedorArticulo.innerHTML = `
        <div class="tour-detail-content active articulo-vlog-completo">
            <h2 style="color: var(--rojo-ariga); font-size: 2.2rem; margin-bottom: 0.5rem;">${vlog.titulo}</h2>
            <div class="articulo-meta" style="color: #666; margin-bottom: 2rem; border-bottom: 1px solid #ddd; padding-bottom: 1rem;">
                <span><i class="fas fa-user-circle"></i> Escrito por: <strong>${vlog.autor}</strong></span>
                <span style="margin-left: 1.5rem;"><i class="far fa-calendar-alt"></i> Publicado el: ${vlog.fecha}</span>
            </div>
            
            <img src="${vlog.imagen}" alt="${vlog.titulo}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 2rem;">
            
            <div class="articulo-texto" style="font-size: 1.1rem; line-height: 1.8; color: #333;">
                <p>${vlog.contenido}</p>
            </div>
        </div>
    `;

    document.getElementById('zona-lectura').scrollIntoView({ behavior: 'smooth', block: 'start' });
}