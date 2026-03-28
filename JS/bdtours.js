let todosLosTours = [];
let fechaGlobal = null; // Variable para atrapar la fecha de la URL

document.addEventListener('DOMContentLoaded', () => {
    // --- MAGIA: CARRUSEL DE FONDO EN LA CABECERA DE DESTINOS ---
    const cabeceraDestinos = document.querySelector('.page-header');
    if (cabeceraDestinos) {
        // Tu lista de fotos (las mismas que en el inicio)
        const fotosFondo = [
            "kamakura1.jpg", "Kamakura2.jpg", "kamakura3.jpg", "kamakura4.jpg",
            "kYOTO.jpg", "kYOTO2.jpg", "kYOTO3.jpg", "kYOTO4.jpg",
            "osaka.jpg", "osaka1.jpg",
            "Tokioundia.jpg", "tokioundia2.jpg", "tokioundia3.jpg",
            "Tokiovicerojo.jpg", "Tokiovicerojo2.jpg", "Tokiovicerojo3.jpg"
        ];
        
        // Mezclamos las fotos al azar
        fotosFondo.sort(() => 0.5 - Math.random());
        let indiceFondo = 0;

        // Le decimos que cambie la foto cada 4 segundos
        setInterval(() => {
            indiceFondo = (indiceFondo + 1) % fotosFondo.length;
            // Mantenemos el filtro negro para que las letras blancas resalten
            cabeceraDestinos.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('Recursos/${fotosFondo[indiceFondo]}')`;
        }, 4000);
    }
    
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

// Variable global para controlar la galería activa en el Lightbox
let imagenesGaleriaActual = [];
let indiceImagenActual = 0;

function mostrarDetalle(tour) {
    document.getElementById('mensaje-default').style.display = 'none'; 
    const contenedorDetalle = document.getElementById('detalle-dinamico');

    let incluyeHTML = tour.incluye ? tour.incluye.map(i => `<li>${i}</li>`).join('') : '<li>No hay detalles especificados.</li>';
    let noIncluyeHTML = tour.noIncluye ? tour.noIncluye.map(i => `<li>${i}</li>`).join('') : '<li>Nada especificado.</li>';

    // NUEVA LÓGICA DE GALERÍA: Usamos carrusel para todo, tenga 1 o 4 fotos.
    imagenesGaleriaActual = tour.galeria || [tour.imagen]; // Si no hay galería, usa la imagen principal
    indiceImagenActual = 0;

    // Generamos las diapositivas del carrusel
    let slidesHTML = imagenesGaleriaActual.map((img, index) => 
        `<img src="${img}" alt="${tour.titulo} ${index + 1}" data-index="${index}" class="tour-carousel-img">`
    ).join('');

    // Si hay más de una foto, mostramos las flechas
    let botonesCarruselHTML = '';
    if (imagenesGaleriaActual.length > 1) {
        botonesCarruselHTML = `
            <button class="tour-car-btn tour-car-prev" id="car-prev">&#10094;</button>
            <button class="tour-car-btn tour-car-next" id="car-next">&#10095;</button>
        `;
    }

    // Inyectamos el HTML del Tour
    contenedorDetalle.innerHTML = `
        <div class="modern-tour-detail">
            
            <div class="modern-header">
                <h2>${tour.titulo}</h2>
                <div class="modern-header-actions">
                    ${tour.precio ? `<span class="modern-price">${tour.precio}</span>` : ''}
                    <button id="btn-wsp-tour" class="btn-primary" style="display: flex; align-items: center; gap: 8px; font-weight: bold; background-color: #25D366; border: none; font-size:1.1rem; padding: 12px 24px;">
                        <i class="fab fa-whatsapp" style="font-size: 1.4rem;"></i> Consultar
                    </button>
                </div>
            </div>

            <div class="tour-carousel-container">
                <div class="tour-carousel-slides" id="carousel-slides">
                    ${slidesHTML}
                </div>
                ${botonesCarruselHTML}
            </div>

            <div class="modern-tabs-container">
                <ul class="tabs-nav">
                    <li class="tour-tab-link active-tour-tab" data-target="desc">Descripción</li>
                    <li class="tour-tab-link" data-target="det">Detalles e Inclusiones</li>
                    <li class="tour-tab-link" data-target="punto">Punto de Encuentro</li>
                </ul>

                <div class="tour-tab-pane active-tour-tab" id="pane-desc">
                    <p style="font-size: 1.1rem; line-height: 1.8; color: #444;">${tour.descripcion}</p>
                </div>

                <div class="tour-tab-pane" id="pane-det">
                    <ul class="details-list">
                        ${tour.duracion ? `
                        <li>
                            <i class="fas fa-hourglass-half"></i>
                            <div class="details-content">
                                <strong>Duración</strong>
                                <span>${tour.duracion}</span>
                            </div>
                        </li>` : ''}
                        
                        <li>
                            <i class="fas fa-comment"></i>
                            <div class="details-content">
                                <strong>Idioma</strong>
                                <span>La actividad se realiza con un guía que habla español.</span>
                            </div>
                        </li>

                        <li>
                            <i class="fas fa-check-circle" style="color: #28a745;"></i>
                            <div class="details-content">
                                <strong>Incluido</strong>
                                <ul>${incluyeHTML}</ul>
                            </div>
                        </li>

                        <li>
                            <i class="fas fa-times-circle" style="color: #e60000;"></i>
                            <div class="details-content">
                                <strong>No incluido</strong>
                                <ul>${noIncluyeHTML}</ul>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="tour-tab-pane" id="pane-punto">
                    <div style="background: #f9f9f9; padding: 2rem; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-map-marker-alt" style="color: var(--rojo-ariga); font-size: 2.5rem;"></i>
                        <div>
                            <h3 style="margin-top:0; margin-bottom: 5px;">Punto de inicio del tour</h3>
                            <p style="font-size: 1.1rem; color: #555; margin:0;">${tour.puntoEncuentro || 'A coordinar luego de la reserva.'}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    `;

    // A. LÓGICA 1: FUNCIONAMIENTO DEL CARRUSEL EN LA PÁGINA
    const slidesContenedor = document.getElementById('carousel-slides');
    const totalImagenes = imagenesGaleriaActual.length;

    if (totalImagenes > 1) {
        let currentSlide = 0;

        function moverCarrusel(indice) {
            currentSlide = (indice + totalImagenes) % totalImagenes; // Maneja bucle infinito
            const desplazamiento = currentSlide * -100; // Mueve por porcentaje
            slidesContenedor.style.transform = `translateX(${desplazamiento}%)`;
        }

        document.getElementById('car-next').addEventListener('click', (e) => {
            e.stopPropagation(); // Evita abrir el lightbox al tocar la flecha
            moverCarrusel(currentSlide + 1);
        });

        document.getElementById('car-prev').addEventListener('click', (e) => {
            e.stopPropagation(); // Evita abrir el lightbox al tocar la flecha
            moverCarrusel(currentSlide - 1);
        });
    }

    // B. LÓGICA 2: ABRIR EL LIGHTBOX (PANTALLA COMPLETA) AL HACER CLIC EN LA FOTO
    const fotosCarrusel = contenedorDetalle.querySelectorAll('.tour-carousel-img');
    fotosCarrusel.forEach(foto => {
        foto.addEventListener('click', (e) => {
            indiceImagenActual = parseInt(e.target.dataset.index); // Guardamos qué foto tocó
            abrirLightbox();
        });
    });

    // C. Lógica para cambiar de pestañas (se mantiene)
    const tabLinks = contenedorDetalle.querySelectorAll('.tour-tab-link');
    const tabPanes = contenedorDetalle.querySelectorAll('.tour-tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            tabLinks.forEach(l => l.classList.remove('active-tour-tab'));
            tabPanes.forEach(p => p.classList.remove('active-tour-tab'));

            link.classList.add('active-tour-tab');
            const targetID = `pane-${link.dataset.target}`;
            document.getElementById(targetID).classList.add('active-tour-tab');
        });
    });

    // D. Lógica de WhatsApp (se mantiene)
    document.getElementById('btn-wsp-tour').addEventListener('click', () => {
        const langSwitch = document.getElementById('lang-switch');
        const idioma = langSwitch ? langSwitch.value : 'es'; 
        let fechaTexto = "";
        if (fechaGlobal) {
            const [year, month, day] = fechaGlobal.split('-');
            fechaTexto = `${day}/${month}/${year}`;
        }
        let mensaje = "";
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
        const urlWsp = `https://wa.me/51994846285?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWsp, '_blank');
    });

    document.getElementById('zona-detalles').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
// --- FUNCIONES DEL LIGHTBOX (VISTA A PANTALLA COMPLETA TIPO TU CAPTURA) ---

// 1. Inyectamos el HTML oculto del Lightbox en el body al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo lo creamos si no existe
    if (!document.getElementById('ariga-lightbox')) {
        const lightboxHTML = `
            <div id="ariga-lightbox" class="lightbox-overlay">
                <button class="lightbox-btn lightbox-close" id="lb-close">&times;</button>
                <button class="lightbox-btn lightbox-prev" id="lb-prev">&#10094;</button>
                <button class="lightbox-btn lightbox-next" id="lb-next">&#10095;</button>
                <img src="" alt="Vista pantalla completa" id="ariga-lightbox-img" class="lightbox-img">
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        inicializarEventosLightbox(); // Programamos sus botones
    }
});

function inicializarEventosLightbox() {
    const lightbox = document.getElementById('ariga-lightbox');
    const lbImg = document.getElementById('ariga-lightbox-img');
    const btnNext = document.getElementById('lb-next');
    const btnPrev = document.getElementById('lb-prev');

    function actualizarImagenLightbox() {
        // Animación suave de salida/entrada
        lbImg.style.animation = 'none';
        lbImg.offsetHeight; // Truco para reiniciar animación
        lbImg.src = imagenesGaleriaActual[indiceImagenActual];
        lbImg.style.animation = 'zoomIn 0.3s ease';
    }

    // Botón Siguiente
    const lbSiguiente = () => {
        indiceImagenActual = (indiceImagenActual + 1) % imagenesGaleriaActual.length;
        actualizarImagenLightbox();
    };

    // Botón Anterior
    const lbAnterior = () => {
        indiceImagenActual = (indiceImagenActual - 1 + imagenesGaleriaActual.length) % imagenesGaleriaActual.length;
        actualizarImagenLightbox();
    };

    btnNext.addEventListener('click', lbSiguiente);
    btnPrev.addEventListener('click', lbAnterior);

    // Cerrar al tocar la X o el fondo negro
    document.getElementById('lb-close').addEventListener('click', cerrarLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'ariga-lightbox') cerrarLightbox();
    });

    // Soporte para flechas del teclado (¡Muy pro!)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') lbSiguiente();
        if (e.key === 'ArrowLeft') lbAnterior();
        if (e.key === 'Escape') cerrarLightbox();
    });
}

function abrirLightbox() {
    const lightbox = document.getElementById('ariga-lightbox');
    const lbImg = document.getElementById('ariga-lightbox-img');
    const btnNext = document.getElementById('lb-next');
    const btnPrev = document.getElementById('lb-prev');

    // Ponemos la foto inicial
    lbImg.src = imagenesGaleriaActual[indiceImagenActual];
    lightbox.classList.add('active'); // Mostramos el panel negro

    // Si hay una sola foto, ocultamos las flechas del lightbox
    if (imagenesGaleriaActual.length <= 1) {
        btnNext.style.display = 'none';
        btnPrev.style.display = 'none';
    } else {
        btnNext.style.display = 'block';
        btnPrev.style.display = 'block';
    }
}

function cerrarLightbox() {
    const lightbox = document.getElementById('ariga-lightbox');
    lightbox.classList.remove('active');
}