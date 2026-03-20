/**
 * ARIGATOURS - INDEX LOGIC
 * Este archivo maneja exclusivamente los carruseles de la página de inicio (index.html).
 */

document.addEventListener('DOMContentLoaded', () => {
    
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