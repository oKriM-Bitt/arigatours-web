/**
 * ARIGATOURS - MAIN LOGIC (GLOBAL)
 * Este archivo maneja elementos que existen en TODAS las páginas (Header, Menú).
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initMegaMenuTabs();
});

// --- LÓGICA DEL MENÚ HAMBURGUESA ---
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');

            const icon = hamburger.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }
}

// --- LÓGICA DE LAS PESTAÑAS DEL MEGA MENÚ ---
function initMegaMenuTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            if (!targetId) return; 

            const megaMenu = tab.closest('.mega-menu');

            // Quitar clase 'active' de las pestañas
            megaMenu.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Ocultar todos los paneles
            megaMenu.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active-pane');
            });

            // Mostrar el panel correcto
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active-pane');
            }
        });
    });
}