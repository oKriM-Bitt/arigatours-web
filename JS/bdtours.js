let todosLosTours = [];

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Conectar y leer la base de datos JSON
    fetch('../JSON/BdTours.json')
        .then(respuesta => respuesta.json())
        .then(datos => {
            todosLosTours = datos;
            renderizarGrilla(todosLosTours); // Dibuja todos los tours al cargar
            
            // Revisar si venimos del index con un tour específico en la URL
            const urlParams = new URLSearchParams(window.location.search);
            const tourSolicitado = urlParams.get('tour');
            if (tourSolicitado) {
                const tourEncontrado = todosLosTours.find(t => t.id === tourSolicitado);
                if (tourEncontrado) {
                    mostrarDetalle(tourEncontrado);
                }
            }
        })
        .catch(error => console.error("Error cargando el JSON:", error));

    // 2. Lógica de los filtros
    const filtroCiudad = document.getElementById('filtro-ciudad');
    const filtroTematica = document.getElementById('filtro-tematica');

    function aplicarFiltros() {
        const ciudad = filtroCiudad.value;
        const tematica = filtroTematica.value;

        const toursFiltrados = todosLosTours.filter(tour => {
            const coincideCiudad = ciudad === 'todas' || tour.ciudad === ciudad;
            const coincideTematica = tematica === 'todas' || tour.tematica === tematica;
            return coincideCiudad && coincideTematica;
        });

        renderizarGrilla(toursFiltrados);
    }

    filtroCiudad.addEventListener('change', aplicarFiltros);
    filtroTematica.addEventListener('change', aplicarFiltros);
});

// 3. Función para dibujar las tarjetas en pantalla
function renderizarGrilla(tours) {
    const contenedor = document.getElementById('contenedor-grilla-tours');
    contenedor.innerHTML = ''; // Limpiamos lo que haya antes

    if (tours.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; width:100%;">No hay guías disponibles con esos filtros.</p>';
        return;
    }

    tours.forEach(tour => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tour-card';
        tarjeta.innerHTML = `
            <img src="${tour.imagen}" alt="${tour.titulo}">
            <div class="tour-card-info">
                <span class="badge-tematica">${tour.tematica}</span>
                <h3>${tour.titulo}</h3>
                <p style="color: #666;"><i class="fas fa-map-marker-alt"></i> ${tour.ciudad}</p>
            </div>
        `;

        // Evento: Al hacer clic en la tarjeta, mostramos sus detalles
        tarjeta.addEventListener('click', () => {
            // Remarcamos la tarjeta activa
            document.querySelectorAll('.tour-card').forEach(c => c.classList.remove('active-card'));
            tarjeta.classList.add('active-card');
            
            mostrarDetalle(tour);
        });

        contenedor.appendChild(tarjeta);
    });
}

// 4. Función para inyectar el detalle del tour en la parte de abajo
function mostrarDetalle(tour) {
    document.getElementById('mensaje-default').style.display = 'none'; // Ocultamos el mensaje inicial
    const contenedorDetalle = document.getElementById('detalle-dinamico');

    // Armamos la lista de "incluye"
    let listaHTML = '';
    tour.incluye.forEach(item => {
        listaHTML += `<li>✔️ ${item}</li>`;
    });

    contenedorDetalle.innerHTML = `
        <div class="tour-detail-content active">
            <div class="detail-header">
                <h2>${tour.titulo}</h2>
            </div>
            <div class="detail-body">
                <div class="detail-text">
                    <h3>Descripción de la experiencia</h3>
                    <p>${tour.descripcion}</p>
                    
                    <h4>¿Qué incluye nuestro servicio de guía?</h4>
                    <ul class="includes-list">
                        ${listaHTML}
                    </ul>
                    
                    <button class="btn-primary">Consultar disponibilidad</button>
                </div>
                <div class="detail-image">
                    <img src="${tour.imagen}" alt="Guía en ${tour.ciudad}">
                </div>
            </div>
        </div>
    `;

    // Hacemos scroll suave hacia los detalles
    document.getElementById('zona-detalles').scrollIntoView({ behavior: 'smooth', block: 'start' });
}