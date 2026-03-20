let todosLosTours = [];
let fechaGlobal = null; // Variable para atrapar la fecha de la URL

document.addEventListener('DOMContentLoaded', () => {
    
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

    if(filtroCiudad && filtroTematica) {
        filtroCiudad.addEventListener('change', aplicarFiltros);
        filtroTematica.addEventListener('change', aplicarFiltros);
    }

    fetch('JSON/BdTours.json') 
        .then(respuesta => respuesta.json())
        .then(datos => {
            todosLosTours = datos;
            renderizarGrilla(todosLosTours); 
            
            const urlParams = new URLSearchParams(window.location.search);
            const tourSolicitado = urlParams.get('tour');
            const ciudadSolicitada = urlParams.get('ciudad');
            
            // ATRAPAMOS LA FECHA
            fechaGlobal = urlParams.get('fecha'); 

            if (tourSolicitado) {
                const tourEncontrado = todosLosTours.find(t => t.id === tourSolicitado);
                if (tourEncontrado) mostrarDetalle(tourEncontrado);
            }

            if (ciudadSolicitada && filtroCiudad) {
                filtroCiudad.value = ciudadSolicitada; 
                aplicarFiltros(); 
            }
        })
        .catch(error => console.error("Error cargando el JSON:", error));
});

function renderizarGrilla(tours) {
    const contenedor = document.getElementById('contenedor-grilla-tours');
    contenedor.innerHTML = ''; 

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

        tarjeta.addEventListener('click', () => {
            document.querySelectorAll('.tour-card').forEach(c => c.classList.remove('active-card'));
            tarjeta.classList.add('active-card');
            mostrarDetalle(tour);
        });

        contenedor.appendChild(tarjeta);
    });
}

function mostrarDetalle(tour) {
    document.getElementById('mensaje-default').style.display = 'none'; 
    const contenedorDetalle = document.getElementById('detalle-dinamico');

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
                    
                    <button id="btn-wsp-tour" class="btn-primary" style="display: flex; align-items: center; gap: 8px; font-weight: bold; background-color: #25D366; border: none;">
                        <i class="fab fa-whatsapp" style="font-size: 1.3rem;"></i> Consultar disponibilidad
                    </button>
                </div>
                <div class="detail-image">
                    <img src="${tour.imagen}" alt="Guía en ${tour.ciudad}">
                </div>
            </div>
        </div>
    `;

    // LÓGICA DE WHATSAPP AL HACER CLIC
    document.getElementById('btn-wsp-tour').addEventListener('click', () => {
        const langSwitch = document.getElementById('lang-switch');
        const idioma = langSwitch ? langSwitch.value : 'es'; // Leemos en qué idioma está la página
        
        let fechaTexto = "";
        if (fechaGlobal) {
            // Pasamos de 2026-03-21 a 21/03/2026
            const [year, month, day] = fechaGlobal.split('-');
            fechaTexto = `${day}/${month}/${year}`;
        }

        let mensaje = "";

        // Elegimos el mensaje según el idioma
        if (idioma === 'en') {
            mensaje = `Hello! I would like to check the availability for the "${tour.titulo}" tour`;
            if (fechaTexto) mensaje += ` for the date ${fechaTexto}`;
            mensaje += `.`;
        } else if (idioma === 'ja') {
            mensaje = `こんにちは、「${tour.titulo}」ツアーの空き状況を確認したいです。`;
            if (fechaTexto) mensaje += `希望日は ${fechaTexto} です。`;
        } else {
            mensaje = `Hola, quiero consultar la disponibilidad del tour "${tour.titulo}"`;
            if (fechaTexto) mensaje += ` para el día ${fechaTexto}`;
            mensaje += `.`;
        }

        // Armamos el enlace final con tu número
        const urlWsp = `https://wa.me/51994846285?text=${encodeURIComponent(mensaje)}`;
        
        // Abrimos WhatsApp en una pestaña nueva
        window.open(urlWsp, '_blank');
    });

    document.getElementById('zona-detalles').scrollIntoView({ behavior: 'smooth', block: 'start' });
}