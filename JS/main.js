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

// --- EFECTO FLOR DE CEREZO SIGUIENDO EL MOUSE ---
const florCerezo = document.createElement('div');
florCerezo.innerHTML = '🌸';

// Estilos de la flor
florCerezo.style.position = 'fixed';
florCerezo.style.pointerEvents = 'none'; // Clave: evita que la flor bloquee los clics
florCerezo.style.fontSize = '24px'; // Tamaño de la flor
florCerezo.style.zIndex = '9999'; // Para que esté por encima de todo
florCerezo.style.transition = 'top 0.1s ease-out, left 0.1s ease-out'; // Le da un efecto de arrastre suave
florCerezo.style.opacity = '0'; // Oculta al principio

document.body.appendChild(florCerezo);

// Hacemos que siga el mouse
document.addEventListener('mousemove', (e) => {
    florCerezo.style.opacity = '1'; // Aparece cuando mueven el mouse
    // Le sumamos 12px para que vaya un poquito abajo a la derecha de la flecha y no la tape
    florCerezo.style.left = (e.clientX + 12) + 'px';
    florCerezo.style.top = (e.clientY + 12) + 'px';
});

// Ocultamos la flor si el mouse sale de la pantalla
document.addEventListener('mouseleave', () => {
    florCerezo.style.opacity = '0';
});


// --- LÓGICA DEL SELECTOR DE IDIOMAS (CON GOOGLE TRANSLATE) ---
// --- LÓGICA DEL SELECTOR DE IDIOMAS (CON MEMORIA LOCAL) ---
document.addEventListener('DOMContentLoaded', () => {
    const langSwitch = document.getElementById('lang-switch');
    
    if (langSwitch) {
        // 1. Al cargar la página, nos fijamos si ya había un idioma guardado en la memoria
        const idiomaGuardado = localStorage.getItem('idiomaAriga');
        
        // Si había uno guardado, actualizamos el botón visualmente
        if (idiomaGuardado) {
            langSwitch.value = idiomaGuardado;
        }

        // 2. Función para darle la orden a Google Translate
        const traducirConGoogle = (idioma) => {
            // Como Google a veces tarda un milisegundo en cargar, lo buscamos con un intervalo
            const buscarGoogle = setInterval(() => {
                const googleSelect = document.querySelector('.goog-te-combo');
                if (googleSelect) {
                    googleSelect.value = idioma;
                    googleSelect.dispatchEvent(new Event('change')); // Damos la orden
                    clearInterval(buscarGoogle); // Apagamos el buscador
                }
            }, 100);
        };

        // 3. Si hay un idioma guardado (y no es español), traducimos la página automáticamente al entrar
        if (idiomaGuardado && idiomaGuardado !== 'es') {
            traducirConGoogle(idiomaGuardado);
        }

        // 4. Qué pasa cuando el usuario elige un idioma nuevo con sus propias manos
        langSwitch.addEventListener('change', (e) => {
            const nuevoIdioma = e.target.value;
            
            // Guardamos el nuevo idioma en la memoria del navegador
            localStorage.setItem('idiomaAriga', nuevoIdioma);
            
            // Mandamos a traducir
            traducirConGoogle(nuevoIdioma);
        });
    }
});