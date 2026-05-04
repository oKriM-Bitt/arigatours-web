let todosLosTours = [];
let fechaGlobal = null; 

document.addEventListener('DOMContentLoaded', () => {
    const cabeceraDestinos = document.querySelector('.page-header');
    if (cabeceraDestinos) {
        const fotosFondo = [
            "kamakura1.jpg", "Kamakura2.jpg", "kamakura3.jpg", "kamakura4.jpg",
            "kYOTO.jpg", "kYOTO2.jpg", "kYOTO3.jpg", "kYOTO4.jpg",
            "osaka.jpg", "osaka1.jpg",
            "Tokioundia.jpg", "tokioundia2.jpg", "tokioundia3.jpg",
            "Tokiovicerojo.jpg", "Tokiovicerojo2.jpg", "Tokiovicerojo3.jpg"
        ];
        
        fotosFondo.sort(() => 0.5 - Math.random());
        let indiceFondo = 0;

        setInterval(() => {
            indiceFondo = (indiceFondo + 1) % fotosFondo.length;
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

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';

    // MAGIA: Leer el JSON correcto según el idioma
    fetch(`JSON/BdTours_${idiomaActual}.json`) 
        .then(respuesta => {
            if (!respuesta.ok) throw new Error("JSON no encontrado");
            return respuesta.json();
        })
        .then(datos => {
            todosLosTours = datos;
            renderizarGrilla(todosLosTours); 
            
            const urlParams = new URLSearchParams(window.location.search);
            const tourSolicitado = urlParams.get('tour');
            const ciudadSolicitada = urlParams.get('ciudad');
            
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
        .catch(error => console.error("Error cargando el JSON de tours:", error));
});

// Diccionario interno para bdtours.js (textos de la tarjeta y detalles)
const dicTours = {
    es: { vacio: "No hay tours disponibles con esos filtros.", desc: "Descripción", det: "Detalles e Inclusiones", punto: "Punto de Encuentro", dur: "Duración", idioma: "Idioma", inc: "Incluido", noinc: "No incluido", coord: "A coordinar luego de la reserva.", cons: "Consultar", noDet: "No hay detalles especificados.", noEsp: "Nada especificado.", msgWsp1: "Hola, quiero consultar la disponibilidad del tour", msgWsp2: "para el día" },
    en: { vacio: "No tours available with those filters.", desc: "Description", det: "Details & Inclusions", punto: "Meeting Point", dur: "Duration", idioma: "Language", inc: "Included", noinc: "Not included", coord: "To be coordinated after booking.", cons: "Inquire", noDet: "No details specified.", noEsp: "Nothing specified.", msgWsp1: "Hello, I would like to check availability for the tour", msgWsp2: "for the date" },
    ja: { vacio: "これらの条件に一致するツアーはありません。", desc: "説明", det: "詳細と含まれるもの", punto: "待ち合わせ場所", dur: "所要時間", idioma: "言語", inc: "含まれるもの", noinc: "含まれないもの", coord: "予約後に調整します。", cons: "問い合わせ", noDet: "詳細は指定されていません。", noEsp: "指定なし。", msgWsp1: "こんにちは、ツアーの空き状況を確認したいです：", msgWsp2: "希望日：" }
};

function renderizarGrilla(tours) {
    const contenedor = document.getElementById('contenedor-grilla-tours');
    if(!contenedor) return;
    contenedor.innerHTML = ''; 

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';
    const txt = dicTours[idiomaActual] || dicTours['es'];

    if (tours.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; width:100%;">${txt.vacio}</p>`;
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
    const msjDef = document.getElementById('mensaje-default');
    if(msjDef) msjDef.style.display = 'none'; 
    
    const contenedorDetalle = document.getElementById('detalle-dinamico');
    if(!contenedorDetalle) return;

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';
    const txt = dicTours[idiomaActual] || dicTours['es'];

    let incluyeHTML = tour.incluye && tour.incluye.length > 0 ? tour.incluye.map(i => `<li>${i}</li>`).join('') : `<li>${txt.noDet}</li>`;
    let noIncluyeHTML = tour.noIncluye && tour.noIncluye.length > 0 ? tour.noIncluye.map(i => `<li>${i}</li>`).join('') : `<li>${txt.noEsp}</li>`;

    imagenesGaleriaActual = tour.galeria && tour.galeria.length > 0 ? tour.galeria : [tour.imagen]; 
    indiceImagenActual = 0;

    let slidesHTML = imagenesGaleriaActual.map((img, index) => 
        `<img src="${img}" alt="${tour.titulo} ${index + 1}" data-index="${index}" class="tour-carousel-img">`
    ).join('');

    let botonesCarruselHTML = '';
    if (imagenesGaleriaActual.length > 1) {
        botonesCarruselHTML = `
            <button class="tour-car-btn tour-car-prev" id="car-prev">&#10094;</button>
            <button class="tour-car-btn tour-car-next" id="car-next">&#10095;</button>
        `;
    }

    // Definimos el texto del idioma dinámicamente
    let idiomaTexto = idiomaActual === 'es' ? "La actividad se realiza con un guía que habla español." : 
                      (idiomaActual === 'en' ? "The activity is conducted with an English/Spanish speaking guide." : 
                      "アクティビティはスペイン語/英語を話すガイドと行われます。");

    contenedorDetalle.innerHTML = `
        <div class="modern-tour-detail">
            <div class="modern-header">
                <h2>${tour.titulo}</h2>
                <div class="modern-header-actions">
                    ${tour.precio ? `<span class="modern-price">${tour.precio}</span>` : ''}
                    <button id="btn-wsp-tour" class="btn-primary" style="display: flex; align-items: center; gap: 8px; font-weight: bold; background-color: #25D366; border: none; font-size:1.1rem; padding: 12px 24px;">
                        <i class="fab fa-whatsapp" style="font-size: 1.4rem;"></i> ${txt.cons}
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
                    <li class="tour-tab-link active-tour-tab" data-target="desc">${txt.desc}</li>
                    <li class="tour-tab-link" data-target="det">${txt.det}</li>
                    <li class="tour-tab-link" data-target="punto">${txt.punto}</li>
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
                                <strong>${txt.dur}</strong>
                                <span>${tour.duracion}</span>
                            </div>
                        </li>` : ''}
                        
                        <li>
                            <i class="fas fa-comment"></i>
                            <div class="details-content">
                                <strong>${txt.idioma}</strong>
                                <span>${idiomaTexto}</span>
                            </div>
                        </li>

                        <li>
                            <i class="fas fa-check-circle" style="color: #28a745;"></i>
                            <div class="details-content">
                                <strong>${txt.inc}</strong>
                                <ul>${incluyeHTML}</ul>
                            </div>
                        </li>

                        <li>
                            <i class="fas fa-times-circle" style="color: #e60000;"></i>
                            <div class="details-content">
                                <strong>${txt.noinc}</strong>
                                <ul>${noIncluyeHTML}</ul>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="tour-tab-pane" id="pane-punto">
                    <div style="background: #f9f9f9; padding: 2rem; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                        <i class="fas fa-map-marker-alt" style="color: var(--rojo-ariga); font-size: 2.5rem;"></i>
                        <div>
                            <h3 style="margin-top:0; margin-bottom: 5px;">${txt.punto}</h3>
                            <p style="font-size: 1.1rem; color: #555; margin:0;">${tour.puntoEncuentro || txt.coord}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const slidesContenedor = document.getElementById('carousel-slides');
    const totalImagenes = imagenesGaleriaActual.length;

    if (totalImagenes > 1) {
        let currentSlide = 0;

        function moverCarrusel(indice) {
            currentSlide = (indice + totalImagenes) % totalImagenes; 
            const desplazamiento = currentSlide * -100; 
            slidesContenedor.style.transform = `translateX(${desplazamiento}%)`;
        }

        document.getElementById('car-next').addEventListener('click', (e) => {
            e.stopPropagation(); 
            moverCarrusel(currentSlide + 1);
        });

        document.getElementById('car-prev').addEventListener('click', (e) => {
            e.stopPropagation(); 
            moverCarrusel(currentSlide - 1);
        });
    }

    const fotosCarrusel = contenedorDetalle.querySelectorAll('.tour-carousel-img');
    fotosCarrusel.forEach(foto => {
        foto.addEventListener('click', (e) => {
            indiceImagenActual = parseInt(e.target.dataset.index); 
            abrirLightbox();
        });
    });

    const tabLinks = contenedorDetalle.querySelectorAll('.tour-tab-link');
    const tabPanes = contenedorDetalle.querySelectorAll('.tour-tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            tabLinks.forEach(l => l.classList.remove('active-tour-tab'));
            tabPanes.forEach(p => p.classList.remove('active-tour-tab'));

            link.classList.add('active-tour-tab');
            const targetID = `pane-${link.dataset.target}`;
            document.getElementById(targetID).classList.add('active-tour-tab');

            if (window.innerWidth <= 768) {
                const tabsContainer = document.querySelector('.modern-tabs-container');
                if (tabsContainer) {
                    tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    document.getElementById('btn-wsp-tour').addEventListener('click', () => {
        let fechaTexto = "";
        if (fechaGlobal) {
            const [year, month, day] = fechaGlobal.split('-');
            fechaTexto = `${day}/${month}/${year}`;
        }
        let mensaje = `${txt.msgWsp1} "${tour.titulo}"`;
        if (fechaTexto) mensaje += ` ${txt.msgWsp2} ${fechaTexto}`;
        mensaje += `.`;
        
        const urlWsp = `https://wa.me/51994846285?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWsp, '_blank');
    });

    document.getElementById('zona-detalles').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- FUNCIONES DEL LIGHTBOX ---
document.addEventListener('DOMContentLoaded', () => {
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
        inicializarEventosLightbox();
    }
});

function inicializarEventosLightbox() {
    const lightbox = document.getElementById('ariga-lightbox');
    const lbImg = document.getElementById('ariga-lightbox-img');
    const btnNext = document.getElementById('lb-next');
    const btnPrev = document.getElementById('lb-prev');

    function actualizarImagenLightbox() {
        lbImg.style.animation = 'none';
        lbImg.offsetHeight; 
        lbImg.src = imagenesGaleriaActual[indiceImagenActual];
        lbImg.style.animation = 'zoomIn 0.3s ease';
    }

    const lbSiguiente = () => {
        indiceImagenActual = (indiceImagenActual + 1) % imagenesGaleriaActual.length;
        actualizarImagenLightbox();
    };

    const lbAnterior = () => {
        indiceImagenActual = (indiceImagenActual - 1 + imagenesGaleriaActual.length) % imagenesGaleriaActual.length;
        actualizarImagenLightbox();
    };

    btnNext.addEventListener('click', lbSiguiente);
    btnPrev.addEventListener('click', lbAnterior);

    document.getElementById('lb-close').addEventListener('click', cerrarLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'ariga-lightbox') cerrarLightbox();
    });

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

    lbImg.src = imagenesGaleriaActual[indiceImagenActual];
    lightbox.classList.add('active'); 

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