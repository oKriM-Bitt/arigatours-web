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

    // Mezclamos la lista al azar como si fuera un mazo de cartas
    const fotosMezcladas = listaFotos.sort(() => 0.5 - Math.random());

    // Buscamos los 3 slides del HTML
    const slidesHero = document.querySelectorAll('.carousel-slide');

    // A cada uno le ponemos una foto distinta de la lista mezclada
    slidesHero.forEach((slide, index) => {
        if (fotosMezcladas[index]) {
            // Mantenemos el filtro oscuro (linear-gradient) para que las letras blancas se sigan leyendo bien
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
        const intervalTime = 10000; // 10 segundos para que no sea tan lento

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

    // --- LÓGICA DEL CARRUSEL DE MAPAS/REGIONES ---
    const regionSlides = document.querySelectorAll('.region-slide');
    const regionPrevBtn = document.getElementById('region-prev');
    const regionNextBtn = document.getElementById('region-next');

    if (regionSlides.length > 0 && regionPrevBtn && regionNextBtn) {
        let currentRegionIndex = 0;

        function showRegion(index) {
            regionSlides.forEach(slide => slide.classList.remove('active'));
            regionSlides[index].classList.add('active');
        }

        regionNextBtn.addEventListener('click', () => {
            currentRegionIndex = (currentRegionIndex + 1) % regionSlides.length;
            showRegion(currentRegionIndex);
        });

        regionPrevBtn.addEventListener('click', () => {
            currentRegionIndex = (currentRegionIndex - 1 + regionSlides.length) % regionSlides.length;
            showRegion(currentRegionIndex);
        });
    }

    // 👇 ACÁ ESTÁ LA MAGIA QUE FALTABA: LLAMAMOS A LA FUNCIÓN 👇
    iniciarCalendario();
});

// --- LÓGICA DEL CALENDARIO DE DISPONIBILIDAD (VERSIÓN MEJORADA) ---
// --- LÓGICA DEL CALENDARIO DE DISPONIBILIDAD (VERSIÓN MEJORADA CON ENLACES) ---
// --- LÓGICA DEL CALENDARIO DE DISPONIBILIDAD (VERSIÓN MEJORADA CON ENLACES Y FECHA) ---
function iniciarCalendario() {
    const contenedor = document.getElementById('calendario-contenedor');
    const infoDia = document.getElementById('info-tour-dia');
    if (!contenedor) return;

    fetch('JSON/BdTours.json')
        .then(respuesta => respuesta.json())
        .then(datosTours => {
            let fechaActual = new Date();
            for (let i = 0; i < 20; i++) {
                let fechaBucle = new Date();
                fechaBucle.setDate(fechaActual.getDate() + i);
                let mes = String(fechaBucle.getMonth() + 1).padStart(2, '0');
                let dia = String(fechaBucle.getDate()).padStart(2, '0');
                let fechaString = `${fechaBucle.getFullYear()}-${mes}-${dia}`;
                let nombreDia = fechaBucle.toLocaleDateString('es-ES', { weekday: 'short' });

                let toursDelDia = datosTours.filter(tour => tour.fechasDisponibles && tour.fechasDisponibles.includes(fechaString));
                const caja = document.createElement('div');
                caja.className = 'dia-caja';

                if (toursDelDia.length > 0) caja.classList.add('dia-verde');
                else caja.classList.add('dia-rojo'); 

                caja.innerHTML = `<span style="text-transform: uppercase; font-size: 0.8rem;">${nombreDia}</span>
                                  <span style="font-size: 1.8rem;">${dia}</span>`;

                caja.addEventListener('click', () => {
                    if (toursDelDia.length > 0) {
                        // LA MAGIA ACÁ: Le agregamos &fecha=${fechaString} al enlace
                        let enlacesTours = toursDelDia.map(t => 
                            `<a href="tours.html?tour=${t.id}&fecha=${fechaString}" style="color: #000; text-decoration: none; border-bottom: 2px solid #e60000; padding-bottom: 2px; transition: opacity 0.3s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">${t.titulo}</a>`
                        ).join(' <br><br> ✔️ '); 
                        infoDia.innerHTML = `<h3 style="color: #28a745; margin-bottom: 1rem;">Disponible el ${dia}/${mes}:</h3>
                                             <p style="font-size: 1.1rem; font-weight: bold; line-height: 1.8;">✔️ ${enlacesTours}</p>`;
                    } else {
                        infoDia.innerHTML = `<h3 style="color: #e60000; margin-bottom: 0.5rem;">Agotado</h3>
                                             <p>No hay tours disponibles para el ${dia}/${mes}. ¡Buscá en los días verdes!</p>`;
                    }
                });
                contenedor.appendChild(caja);
            }
        })
        .catch(error => console.error("Error cargando el calendario:", error));
}

// --- LÓGICA PARA CARGAR SCROLLER DE TOURS EN EL INICIO (CON CLIMA) ---
document.addEventListener('DOMContentLoaded', () => {
    const contenedorInicio = document.getElementById('contenedor-tours-inicio');
    if (!contenedorInicio) return;

    fetch('JSON/BdTours.json')
        .then(respuesta => respuesta.json())
        .then(tours => {
            contenedorInicio.innerHTML = ''; 

            // Función ninja para dar el clima según la ciudad
            function obtenerClimaHTML(ciudad) {
                if (ciudad === 'Tokio' || ciudad === 'Kanagawa') {
                    return `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px;">
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#e91e63">🌸 Prim:</span> 15-20°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#ff9800">☀️ Ver:</span> 25-32°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#795548">🍁 Oto:</span> 18-23°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#03a9f4">❄️ Inv:</span> 5-12°C</div>
                        </div>`;
                } else {
                    return `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px;">
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#e91e63">🌸 Prim:</span> 16-22°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#ff9800">☀️ Ver:</span> 27-34°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#795548">🍁 Oto:</span> 19-24°C</div>
                            <div style="background:#f4f4f4; padding:8px; border-radius:6px; font-size:0.85rem;"><span style="color:#03a9f4">❄️ Inv:</span> 6-13°C</div>
                        </div>`;
                }
            }

            // Tomamos los 4 tours principales
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
                            <strong style="color: #333; font-size: 0.95rem;">Clima en la región:</strong>
                            ${climaHTML}
                        </div>

                        <div style="margin-top: auto; text-align: right; padding-top: 15px;">
                            <a href="tours.html?tour=${tour.id}" class="btn-primary" style="text-decoration: none; padding: 10px 20px; font-size: 1rem; border-radius: 6px; display: inline-block;">
                                Ver itinerario <i class="fas fa-arrow-right" style="margin-left: 5px;"></i>
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
    if (!contenedorDropdown) return; // Si no encuentra el contenedor, no hace nada

    // Vamos a buscar la base de datos
    fetch('JSON/BdTours.json')
        .then(respuesta => respuesta.json())
        .then(tours => {
            // Limpiamos el texto de "Cargando..."
            contenedorDropdown.innerHTML = '';

            // Usamos un Set para no repetir ciudades si tenemos varios tours en la misma (ej. Tokio Vice y Tokio Todo en un Día)
            const ciudadesAgregadas = new Set();

            tours.forEach(tour => {
                // Si la ciudad ya se agregó al menú, saltamos al siguiente tour
                if (ciudadesAgregadas.has(tour.ciudad.toLowerCase())) return;

                // Si es una ciudad nueva, la marcamos como agregada
                ciudadesAgregadas.add(tour.ciudad.toLowerCase());

                // Vemos qué imagen usar (la primera de la galería si tiene, sino la principal)
                let imagenMostrar = (tour.galeria && tour.galeria.length > 0) ? tour.galeria[0] : tour.imagen;

                // Creamos la tarjeta dinámica vinculada a la ciudad
                const tarjetaMenu = document.createElement('a');
                tarjetaMenu.className = 'destination-menu-card';
                // Vinculamos el enlace a la página de tours filtrando por ciudad
                tarjetaMenu.href = `tours.html?ciudad=${tour.ciudad}`;

                tarjetaMenu.innerHTML = `
                    <img src="${imagenMostrar}" alt="Destino ${tour.ciudad}">
                    <div class="destination-menu-overlay">
                        <h3>${tour.ciudad}</h3>
                    </div>
                `;
                contenedorDropdown.appendChild(tarjetaMenu);
            });

            // Si por alguna razón no hay tours en la base de datos
            if (ciudadesAgregadas.size === 0) {
                contenedorDropdown.innerHTML = '<p style="text-align:center; color:#888; width:100%;">No hay destinos disponibles actualmente.</p>';
            }
        })
        .catch(error => {
            console.error("Error cargando el menú dinámico:", error);
            contenedorDropdown.innerHTML = '<p style="text-align:center; color:#888; width:100%;">No pudimos cargar los destinos.</p>';
        });
});