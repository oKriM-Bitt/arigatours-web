const API_BASE_URL = (() => {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    return 'https://arigatours-backend.onrender.com';
})();

const TOURS_API_URL = `${API_BASE_URL}/api/tours`;

let todosLosTours = [];
let fechaGlobal = null;
let filtroCiudad = null;
let filtroTematica = null;

// ── Clasificación de tours por precio ─────────────────────────────────────
function esTourGratuito(tour) {
    const p = tour.precio;
    if (p === 0 || p === null || p === undefined || p === '') return true;
    if (typeof p === 'string') {
        const lower = p.toLowerCase().trim();
        return ['0', '0 €', '0€', 'gratis', 'free'].includes(lower)
            || lower.includes('propina')
            || lower.includes('voluntari');
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    const cabeceraDestinos = document.querySelector('.page-header');
    if (cabeceraDestinos) {
        const fotosFondo = [
            "HIJI3.jpg", "Kamakura8.jpg",
            "kobe3.jpg", "kobe4.jpg", "kYOTO4.jpg",
            "NARA2.jpg", "osaka4.jpg",
            "Tokioundia.jpg", "Tokiovicerojo6.jpg"
        ];

        fotosFondo.sort(() => 0.5 - Math.random());
        let indiceFondo = 0;

        setInterval(() => {
            indiceFondo = (indiceFondo + 1) % fotosFondo.length;
            cabeceraDestinos.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('Recursos/${fotosFondo[indiceFondo]}')`;
        }, 4000);
    }

    filtroCiudad = document.getElementById('filtro-ciudad');
    filtroTematica = document.getElementById('filtro-tematica');

    if (filtroCiudad && filtroTematica) {
        filtroCiudad.addEventListener('change', aplicarFiltros);
        filtroTematica.addEventListener('change', aplicarFiltros);
    }

    const langSwitch = document.getElementById('lang-switch');
    if (langSwitch) {
        langSwitch.addEventListener('change', async () => {
            const lang = langSwitch.value;
            await precargarTraduccion(lang);
            const traducidos = obtenerToursTraducidos(lang);
            poblarFiltros(traducidos);
            renderizarGrilla(traducidos);
        });
    }

    cargarToursDesdeAPI();
});

async function cargarToursDesdeAPI() {
    const contenedor = document.getElementById('contenedor-grilla-tours');
    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';
    const txt = dicTours[idiomaActual] || dicTours.es;

    if (contenedor) {
        contenedor.innerHTML = '<p style="text-align:center; width:100%;">Cargando tours...</p>';
    }

    try {
        const respuesta = await fetch(`${TOURS_API_URL}?lang=${idiomaActual}`);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        todosLosTours = Array.isArray(datos) ? datos : [];
        procesarToursCargados();
    } catch (error) {
        console.error('Error cargando tours desde la API:', error);
        todosLosTours = [];

        if (contenedor) {
            contenedor.innerHTML = '<p style="text-align:center; width:100%;">No se pudieron cargar los tours. Verifica que el servidor esté activo.</p>';
        }
    }
}

function procesarToursCargados() {
    // Filtro de tipo de página definido inline: 'free' | 'privado' | null
    const filtroTipo = window.ARIGA_FILTRO_TIPO || null;
    let toursVista = todosLosTours;
    if (filtroTipo === 'free')    toursVista = todosLosTours.filter(esTourGratuito);
    if (filtroTipo === 'privado') toursVista = todosLosTours.filter(t => !esTourGratuito(t));

    poblarFiltros(toursVista);
    renderizarGrilla(toursVista);

    const urlParams = new URLSearchParams(window.location.search);
    const tourSolicitado  = urlParams.get('tour');
    const ciudadSolicitada = urlParams.get('ciudad'); // para el <select> filtro
    const citySlug         = urlParams.get('city');   // para scroll por ciudad

    fechaGlobal = urlParams.get('fecha');

    if (tourSolicitado) {
        const tourEncontrado = toursVista.find((t) => t.id === tourSolicitado);
        if (tourEncontrado) mostrarDetalle(tourEncontrado);
    }

    if (ciudadSolicitada && filtroCiudad) {
        filtroCiudad.value = ciudadSolicitada;
        aplicarFiltros();
    }

    // Enfocar ciudad si viene el param ?city=
    if (citySlug) {
        // Pequeño delay para que el DOM del streaming haya terminado de pintarse
        requestAnimationFrame(() => enfocarCiudad(citySlug));
    }
}

// ── Scroll automático + highlight a la sección de una ciudad ─────────────────
function enfocarCiudad(citySlug) {
    // Normalizar: quitar tildes, minúsculas (igual que el data-city del DOM)
    const slug = citySlug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const sections = document.querySelectorAll('.streaming-row-section');
    if (!sections.length) return;

    let targetSection = null;

    sections.forEach((sec) => {
        const secSlug = (sec.dataset.city || '').toLowerCase();
        if (secSlug === slug) {
            targetSection = sec;
            sec.classList.add('streaming-city-active');
        } else {
            sec.classList.add('streaming-city-dimmed');
        }
    });

    if (targetSection) {
        // Scroll suave a la sección con un pequeño offset para que el título quede visible
        const navH = document.querySelector('.navbar')
            ? document.querySelector('.navbar').offsetHeight
            : 80;

        const top = targetSection.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });

        // Botón "Ver todas las ciudades" inyectado dinámicamente
        inyectarBotonVerTodas(targetSection);
    }
}

// ── Inyectar botón para limpiar el enfoque y mostrar todas las ciudades ───────
function inyectarBotonVerTodas(anchorSection) {
    if (document.getElementById('btn-ver-todas-ciudades')) return; // ya existe

    const lang = localStorage.getItem('idiomaAriga') || 'es';
    const label = { es: 'Ver todas las ciudades', en: 'View all cities', ja: 'すべての都市を見る' }[lang] || 'Ver todas';

    const btn = document.createElement('button');
    btn.id = 'btn-ver-todas-ciudades';
    btn.className = 'btn-ver-todas-ciudades';
    btn.textContent = '× ' + label;
    btn.addEventListener('click', () => {
        document.querySelectorAll('.streaming-row-section').forEach((s) => {
            s.classList.remove('streaming-city-active', 'streaming-city-dimmed');
        });
        btn.remove();
        // Limpiar el param de la URL sin recargar
        const url = new URL(window.location.href);
        url.searchParams.delete('city');
        window.history.replaceState({}, '', url.toString());
    });

    // Insertar el botón justo antes de la sección activa
    const contenedor = document.getElementById('contenedor-grilla-tours');
    if (contenedor) contenedor.insertBefore(btn, anchorSection);
}

function aplicarFiltros() {
    if (!filtroCiudad || !filtroTematica) return;

    const ciudad = filtroCiudad.value;
    const tematica = filtroTematica.value;

    const toursFiltrados = todosLosTours.filter((tour) => {
        const coincideCiudad = ciudad === 'todas' || tour.ciudad === ciudad;
        const coincideTematica = tematica === 'todas' || tour.tematica === tematica;
        return coincideCiudad && coincideTematica;
    });

    renderizarGrilla(toursFiltrados);
}

// Diccionario interno para bdtours.js (textos de la tarjeta y detalles)
const dicTours = {
    es: { vacio: "No hay tours disponibles con esos filtros.", desc: "Descripción", det: "Detalles e Inclusiones", punto: "Punto de Encuentro", dur: "Duración", idioma: "Idioma", inc: "Incluido", noinc: "No incluido", coord: "A coordinar luego de la reserva.", cons: "Consultar", noDet: "No hay detalles especificados.", noEsp: "Nada especificado.", msgWsp1: "Hola, quiero consultar la disponibilidad del tour", msgWsp2: "para el día" },
    en: { vacio: "No tours available with those filters.", desc: "Description", det: "Details & Inclusions", punto: "Meeting Point", dur: "Duration", idioma: "Language", inc: "Included", noinc: "Not included", coord: "To be coordinated after booking.", cons: "Inquire", noDet: "No details specified.", noEsp: "Nothing specified.", msgWsp1: "Hello, I would like to check availability for the tour", msgWsp2: "for the date" },
    ja: { vacio: "これらの条件に一致するツアーはありません。", desc: "説明", det: "詳細と含まれるもの", punto: "待ち合わせ場所", dur: "所要時間", idioma: "言語", inc: "含まれるもの", noinc: "含まれないもの", coord: "予約後に調整します。", cons: "問い合わせ", noDet: "詳細は指定されていません。", noEsp: "指定なし。", msgWsp1: "こんにちは、ツアーの空き状況を確認したいです：", msgWsp2: "希望日：" }
};

// ── TRADUCCIONES MULTILINGÜE ──────────────────────────────────────────────
const toursCache = {};

async function precargarTraduccion(lang) {
    if (lang === 'es' || toursCache[lang]) return;
    try {
        const r = await fetch(`../JSON/BdTours_${lang}.json`);
        if (r.ok) toursCache[lang] = await r.json();
    } catch { /* sin traducción disponible */ }
}

function obtenerToursTraducidos(lang) {
    if (lang === 'es' || !toursCache[lang]) return todosLosTours;
    return todosLosTours.map(t => {
        const tr = toursCache[lang].find(x => x.id === t.id);
        if (!tr) return t;
        return {
            ...t,
            titulo:         tr.titulo         || t.titulo,
            descripcion:    tr.descripcion    || t.descripcion,
            tematica:       tr.tematica       || t.tematica,
            ciudad:         tr.ciudad         || t.ciudad,
            puntoEncuentro: tr.puntoEncuentro || t.puntoEncuentro,
            incluye:        Array.isArray(tr.incluye)    ? tr.incluye    : t.incluye,
            noIncluye:      Array.isArray(tr.noIncluye)  ? tr.noIncluye  : t.noIncluye,
        };
    });
}

function poblarFiltros(tours) {
    if (!filtroCiudad || !filtroTematica) return;
    const lang = localStorage.getItem('idiomaAriga') || 'es';
    const labelCiudad    = { es: 'Todas las ciudades', en: 'All Cities',  ja: 'すべての都市'  }[lang] || 'Todas';
    const labelTematica  = { es: 'Todas las temáticas', en: 'All Themes', ja: 'すべてのテーマ' }[lang] || 'Todas';

    const prevCiudad   = filtroCiudad.value;
    const prevTematica = filtroTematica.value;

    const ciudades  = [...new Set(tours.map(t => t.ciudad).filter(Boolean))].sort();
    const tematicas = [...new Set(tours.map(t => t.tematica).filter(Boolean))].sort();

    filtroCiudad.innerHTML  = `<option value="todas">${labelCiudad}</option>`  + ciudades.map(c  => `<option value="${c}">${c}</option>`).join('');
    filtroTematica.innerHTML = `<option value="todas">${labelTematica}</option>` + tematicas.map(t => `<option value="${t}">${t}</option>`).join('');

    if ([...filtroCiudad.options].some(o  => o.value === prevCiudad))   filtroCiudad.value   = prevCiudad;
    if ([...filtroTematica.options].some(o => o.value === prevTematica)) filtroTematica.value = prevTematica;
}
// ─────────────────────────────────────────────────────────────────────────────

function normalizarTour(tour) {
    return {
        ...tour,
        galeria: Array.isArray(tour.galeria) ? tour.galeria : [],
        incluye: Array.isArray(tour.incluye) ? tour.incluye : [],
        noIncluye: Array.isArray(tour.noIncluye) ? tour.noIncluye : [],
        fechasDisponibles: Array.isArray(tour.fechasDisponibles) ? tour.fechasDisponibles : [],
    };
}

function renderizarGrilla(tours) {
    const contenedor = document.getElementById('contenedor-grilla-tours');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';
    const txt = dicTours[idiomaActual] || dicTours.es;

    if (tours.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; width:100%; padding:2rem;">${txt.vacio}</p>`;
        return;
    }

    // ── Agrupar por ciudad (orden de aparición) ──
    const grupos = {};
    const ordenCiudades = [];
    tours.forEach((tourRaw) => {
        const tour = normalizarTour(tourRaw);
        const ciudad = tour.ciudad || 'Otros';
        if (!grupos[ciudad]) {
            grupos[ciudad] = [];
            ordenCiudades.push(ciudad);
        }
        grupos[ciudad].push(tour);
    });

    // ── Renderizar una fila por ciudad ──
    const wrapper = document.createElement('div');
    wrapper.className = 'streaming-container';

    ordenCiudades.forEach((ciudad) => {
        const section = document.createElement('div');
        section.className = 'streaming-row-section';
        section.dataset.city = ciudad.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        const titulo = document.createElement('h2');
        titulo.className = 'streaming-row-title';
        titulo.textContent = ciudad;
        section.appendChild(titulo);

        const fila = document.createElement('div');
        fila.className = 'streaming-row';

        grupos[ciudad].forEach((tour) => {
            const card = document.createElement('div');
            card.className = 'stream-card';
            card.innerHTML = `
                <div class="stream-card-img">
                    <img src="${tour.imagen}" alt="${tour.titulo}" loading="lazy">
                    <div class="stream-card-overlay">
                        <span class="stream-badge">${tour.tematica || ''}</span>
                        <h3>${tour.titulo}</h3>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                document.querySelectorAll('.stream-card').forEach((c) => c.classList.remove('active-card'));
                card.classList.add('active-card');
                mostrarDetalle(tour);
            });

            fila.appendChild(card);
        });

        secuenciarDragScroll(fila);
        section.appendChild(fila);
        wrapper.appendChild(section);
    });

    contenedor.appendChild(wrapper);
}

// ── Mouse Drag-to-Scroll para .streaming-row (desktop) ───────────────────────
function secuenciarDragScroll(fila) {
    let arrastrandO  = false;
    let startX       = 0;
    let scrollIzq    = 0;

    fila.addEventListener('mousedown', (e) => {
        // Solo botón izquierdo y no sobre botones/links
        if (e.button !== 0) return;
        arrastrandO = true;
        startX      = e.pageX - fila.offsetLeft;
        scrollIzq   = fila.scrollLeft;
        fila.classList.add('drag-active');
        e.preventDefault(); // evita selección de texto
    });

    fila.addEventListener('mouseleave', () => {
        arrastrandO = false;
        fila.classList.remove('drag-active');
    });

    fila.addEventListener('mouseup', () => {
        arrastrandO = false;
        fila.classList.remove('drag-active');
    });

    fila.addEventListener('mousemove', (e) => {
        if (!arrastrandO) return;
        const x = e.pageX - fila.offsetLeft;
        const distancia = (x - startX) * 1.4; // factor de velocidad
        fila.scrollLeft = scrollIzq - distancia;
    });
}

// Variable global para controlar la galería activa en el Lightbox
let imagenesGaleriaActual = [];
let indiceImagenActual = 0;

function mostrarDetalle(tourRaw) {
    const tour = normalizarTour(tourRaw);
    const msjDef = document.getElementById('mensaje-default');
    if (msjDef) msjDef.style.display = 'none';

    const contenedorDetalle = document.getElementById('detalle-dinamico');
    if (!contenedorDetalle) return;

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';
    const txt = dicTours[idiomaActual] || dicTours.es;

    let incluyeHTML = tour.incluye.length > 0 ? tour.incluye.map((i) => `<li>${i}</li>`).join('') : `<li>${txt.noDet}</li>`;
    let noIncluyeHTML = tour.noIncluye.length > 0 ? tour.noIncluye.map((i) => `<li>${i}</li>`).join('') : `<li>${txt.noEsp}</li>`;

    imagenesGaleriaActual = tour.galeria.length > 0 ? tour.galeria : [tour.imagen]; 
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
        
        const urlWsp = `https://wa.me/817064382066?text=${encodeURIComponent(mensaje)}`;
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