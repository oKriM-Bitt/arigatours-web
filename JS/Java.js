/**
 * ARIGATOURS - INDEX LOGIC
 * Este archivo maneja exclusivamente los carruseles de la página de inicio (index.html).
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- MAGIA: FONDOS ALEATORIOS PARA EL INICIO ---
    const listaFotos = [
        "kamakura1.jpg", "Kamakura2.jpg", "kamakura3.jpg", "kamakura4.jpg",
        "kYOTO.jpg", "kYOTO2.jpg", "kYOTO3.jpg", "kYOTO4.jpg",
        "osaka.jpg", "osaka1.jpg",
        "Tokioundia.jpg", "tokioundia2.jpg", "tokioundia3.jpg",
        "Tokiovicerojo.jpg", "Tokiovicerojo2.jpg", "Tokiovicerojo3.jpg",
        "Tokiovicerojo4.jpg", "Tokiovicerojo5.jpg", "Tokiovicerojo6.jpg"
    ];

    const fotosMezcladas = listaFotos.sort(() => 0.5 - Math.random());
    const slidesHero = document.querySelectorAll('.carousel-slide');

    slidesHero.forEach((slide, index) => {
        if (fotosMezcladas[index]) {
            slide.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('Recursos/${fotosMezcladas[index]}')`;
        }
    });

    // --- LÓGICA DEL CARRUSEL HERO GIGANTE ---
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        let slideInterval;
        const intervalTime = 10000;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            slides[index].classList.add('active');
            dots[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, intervalTime);
        }

        if(nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
            prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                resetInterval();
            });
        });

        slideInterval = setInterval(nextSlide, intervalTime);
    }

    iniciarCalendario();
});

// --- LÓGICA DEL CALENDARIO DE DISPONIBILIDAD (MULTI-IDIOMA) ---
function iniciarCalendario() {
    const contenedor = document.getElementById('calendario-contenedor');
    const infoDia = document.getElementById('info-tour-dia');
    if (!contenedor) return;

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';
    
    // Mapeo de códigos de idioma para las fechas
    const localesFecha = { 'es': 'es-ES', 'en': 'en-US', 'ja': 'ja-JP' };
    const localeString = localesFecha[idiomaActual];

    // Diccionario para los textos internos del calendario
    const textosCal = {
        es: { disp: "Disponible el", agotado: "Agotado", noTours: "No hay tours disponibles para el", busca: "¡Buscá en los días verdes!" },
        en: { disp: "Available on", agotado: "Sold out", noTours: "No tours available for", busca: "Look for the green days!" },
        ja: { disp: "利用可能", agotado: "売り切れ", noTours: "ツアーはありません", busca: "緑の日を探してください！" }
    };
    const txt = textosCal[idiomaActual] || textosCal['es'];

    fetch(`JSON/BdTours_${idiomaActual}.json`)
        .then(respuesta => respuesta.json())
        .then(datosTours => {
            let fechaActual = new Date();
            for (let i = 0; i < 20; i++) {
                let fechaBucle = new Date();
                fechaBucle.setDate(fechaActual.getDate() + i);
                let mes = String(fechaBucle.getMonth() + 1).padStart(2, '0');
                let dia = String(fechaBucle.getDate()).padStart(2, '0');
                let fechaString = `${fechaBucle.getFullYear()}-${mes}-${dia}`;
                
                // Genera el nombre del día en el idioma correcto (Lun, Mon, 月)
                let nombreDia = fechaBucle.toLocaleDateString(localeString, { weekday: 'short' });

                let toursDelDia = datosTours.filter(tour => tour.fechasDisponibles && tour.fechasDisponibles.includes(fechaString));
                const caja = document.createElement('div');
                caja.className = 'dia-caja';

                if (toursDelDia.length > 0) caja.classList.add('dia-verde');
                else caja.classList.add('dia-rojo'); 

                caja.innerHTML = `<span style="text-transform: uppercase; font-size: 0.8rem;">${nombreDia}</span>
                                  <span style="font-size: 1.8rem;">${dia}</span>`;

                caja.addEventListener('click', () => {
                    if (toursDelDia.length > 0) {
                        let enlacesTours = toursDelDia.map(t => 
                            `<a href="tours.html?tour=${t.id}&fecha=${fechaString}" style="color: #000; text-decoration: none; border-bottom: 2px solid #e60000; padding-bottom: 2px; transition: opacity 0.3s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">${t.titulo}</a>`
                        ).join(' <br><br> ✔️ '); 
                        infoDia.innerHTML = `<h3 style="color: #28a745; margin-bottom: 1rem;">${txt.disp} ${dia}/${mes}:</h3>
                                             <p style="font-size: 1.1rem; font-weight: bold; line-height: 1.8;">✔️ ${enlacesTours}</p>`;
                    } else {
                        infoDia.innerHTML = `<h3 style="color: #e60000; margin-bottom: 0.5rem;">${txt.agotado}</h3>
                                             <p>${txt.noTours} ${dia}/${mes}. ${txt.busca}</p>`;
                    }
                });
                contenedor.appendChild(caja);
            }
        })
        .catch(error => console.error("Error cargando el calendario:", error));
}

// --- LÓGICA PARA CARGAR GRILLA DE TOURS EN EL INICIO (MULTI-IDIOMA) ---
document.addEventListener('DOMContentLoaded', () => {
    const contenedorInicio = document.getElementById('contenedor-tours-inicio');
    if (!contenedorInicio) return;

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';

    // Diccionario para los textos internos de las tarjetas
    const textosTarjeta = {
        es: { clima: "Clima en la región:", ver: "Ver itinerario", prim: "Prim", ver: "Ver", oto: "Oto", inv: "Inv" },
        en: { clima: "Weather in the region:", ver: "View itinerary", prim: "Spr", ver: "Sum", oto: "Aut", inv: "Win" },
        ja: { clima: "地域の天気:", ver: "旅程を見る", prim: "春", ver: "夏", oto: "秋", inv: "冬" }
    };
    const tCard = textosTarjeta[idiomaActual] || textosTarjeta['es'];

    fetch(`JSON/BdTours_${idiomaActual}.json`)
        .then(respuesta => respuesta.json())
        .then(tours => {
            contenedorInicio.innerHTML = ''; 

            function obtenerClimaHTML(ciudad) {
                if (ciudad === 'Tokio' || ciudad === 'Tokyo' || ciudad === 'Kanagawa') {
                    return `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px;">
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#e91e63">🌸 ${tCard.prim}:</span> 15-20°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#ff9800">☀️ ${tCard.ver}:</span> 25-32°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#795548">🍁 ${tCard.oto}:</span> 18-23°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#03a9f4">❄️ ${tCard.inv}:</span> 5-12°C</div>
                        </div>`;
                } else {
                    return `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px;">
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#e91e63">🌸 ${tCard.prim}:</span> 16-22°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#ff9800">☀️ ${tCard.ver}:</span> 27-34°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#795548">🍁 ${tCard.oto}:</span> 19-24°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#03a9f4">❄️ ${tCard.inv}:</span> 6-13°C</div>
                        </div>`;
                }
            }

            const toursMostrar = tours.slice(0, 4);

            toursMostrar.forEach(tour => {
                let divTemporal = document.createElement("div");
                divTemporal.innerHTML = tour.descripcion;
                let textoLimpio = divTemporal.textContent || divTemporal.innerText || "";
                let resumenCorto = textoLimpio.substring(0, 140) + "...";

                let imagenMostrar = (tour.galeria && tour.galeria.length > 0) ? tour.galeria[0] : tour.imagen;
                let climaHTML = obtenerClimaHTML(tour.ciudad);

                const slide = document.createElement('div');
                slide.className = 'tour-scroll-slide';

                slide.innerHTML = `
                    <div class="tour-scroll-img-box">
                        <img src="${imagenMostrar}" alt="${tour.titulo}">
                        <span style="position: absolute; top: 20px; right: 20px; background: var(--rojo-ariga); color: #fff; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <i class="fas fa-map-marker-alt"></i> ${tour.ciudad}
                        </span>
                    </div>
                    <div class="tour-scroll-content">
                        <div class="tour-scroll-encabezado">
                            <h3>${tour.titulo}</h3>
                            <span>${tour.precio ? tour.precio.split(' ')[0] + ' €' : ''}</span>
                        </div>
                        <p style="color: #666; font-size: 1rem; line-height: 1.6; margin-bottom: 15px;">${resumenCorto}</p>
                        <div>
                            <strong style="color: #333; font-size: 0.95rem;">${tCard.clima}</strong>
                            ${climaHTML}
                        </div>
                        <div style="margin-top: auto; text-align: right; padding-top: 15px;">
                            <a href="tours.html?tour=${tour.id}" class="btn-primary" style="text-decoration: none; padding: 10px 20px; font-size: 1rem; border-radius: 6px; display: inline-block;">
                                ${tCard.ver} <i class="fas fa-arrow-right" style="margin-left: 5px;"></i>
                            </a>
                        </div>
                    </div>
                `;
                contenedorInicio.appendChild(slide);
            });
        })
        .catch(error => console.error("Error cargando los tours en el inicio:", error));
});

// --- LÓGICA PARA CARGAR EL MEGA MENU DINÁMICO DESDE EL JSON ---
document.addEventListener('DOMContentLoaded', () => {
    const contenedorDropdown = document.getElementById('dynamic-dropdown-container');
    if (!contenedorDropdown) return;

    const idiomaActual = localStorage.getItem('idiomaAriga') || 'es';

    fetch(`JSON/BdTours_${idiomaActual}.json`)
        .then(respuesta => respuesta.json())
        .then(tours => {
            contenedorDropdown.innerHTML = '';
            const ciudadesAgregadas = new Set();

            tours.forEach(tour => {
                if (ciudadesAgregadas.has(tour.ciudad.toLowerCase())) return;
                ciudadesAgregadas.add(tour.ciudad.toLowerCase());

                let imagenMostrar = (tour.galeria && tour.galeria.length > 0) ? tour.galeria[0] : tour.imagen;

                const tarjetaMenu = document.createElement('a');
                tarjetaMenu.className = 'destination-menu-card';
                tarjetaMenu.href = `tours.html?ciudad=${tour.ciudad}`;

                tarjetaMenu.innerHTML = `
                    <img src="${imagenMostrar}" alt="Destino ${tour.ciudad}">
                    <div class="destination-menu-overlay">
                        <h3>${tour.ciudad}</h3>
                    </div>
                `;
                contenedorDropdown.appendChild(tarjetaMenu);
            });

            if (ciudadesAgregadas.size === 0) {
                contenedorDropdown.innerHTML = '<p style="text-align:center; color:#888; width:100%;">No hay destinos disponibles actualmente.</p>';
            }
        })
        .catch(error => {
            console.error("Error cargando el menú dinámico:", error);
            contenedorDropdown.innerHTML = '<p style="text-align:center; color:#888; width:100%;">No pudimos cargar los destinos.</p>';
        });
});