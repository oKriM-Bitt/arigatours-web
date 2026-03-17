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
});