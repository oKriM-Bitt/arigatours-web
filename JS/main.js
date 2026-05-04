/**
 * ARIGATOURS - MAIN LOGIC (GLOBAL)
 * Este archivo maneja elementos que existen en TODAS las páginas (Header, Menú).
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initMegaMenuTabs();

    // Arrancamos la lluvia de Japón en TODAS las pantallas
    iniciarLluviaJapon();
});

// --- LÓGICA DEL MENÚ HAMBURGUESA ---
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const headerActions = document.querySelector('.header-actions'); // Seleccionamos redes/idioma

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            // Abrimos/cerramos el menú principal
            navLinks.classList.toggle('nav-active');

            // Abrimos/cerramos las redes e idioma
            if (headerActions) {
                headerActions.classList.toggle('nav-active');
            }

            // Cambiamos el icono de hamburguesa a una "X"
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
// --- GESTIÓN DE IDIOMAS ---
document.addEventListener('DOMContentLoaded', () => {
    const langSwitches = document.querySelectorAll('#lang-switch');
    const idiomaInicial = localStorage.getItem('idiomaAriga') || 'es';

    langSwitches.forEach(select => {
        select.value = idiomaInicial;
        select.addEventListener('change', (e) => {
            const nuevoIdioma = e.target.value;
            localStorage.setItem('idiomaAriga', nuevoIdioma);
            window.location.reload(); // Recarga para traer el JSON correcto
        });
    });

    aplicarIdioma(idiomaInicial);
});
/*
// --- LÓGICA DEL SELECTOR DE IDIOMAS (CON MEMORIA LOCAL) ---
document.addEventListener('DOMContentLoaded', () => {
    // Buscamos si hay selectores de idioma (puede haber más de uno ahora con el diseño mobile)
    const langSwitches = document.querySelectorAll('#lang-switch'); // Usa clase en vez de ID si hay varios
    
    if (langSwitches.length > 0) {
        // 1. Al cargar la página, nos fijamos si ya había un idioma guardado en la memoria
        const idiomaGuardado = localStorage.getItem('idiomaAriga');
        
        // Si había uno guardado, actualizamos los botones visualmente
        if (idiomaGuardado) {
            langSwitches.forEach(btn => btn.value = idiomaGuardado);
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
        langSwitches.forEach(langSwitch => {
            langSwitch.addEventListener('change', (e) => {
                const nuevoIdioma = e.target.value;
                
                // Guardamos el nuevo idioma en la memoria del navegador
                localStorage.setItem('idiomaAriga', nuevoIdioma);
                
                // Actualizamos todos los selectores para que estén sincronizados
                langSwitches.forEach(btn => btn.value = nuevoIdioma);
                
                // Mandamos a traducir
                traducirConGoogle(nuevoIdioma);
            });
        });
    }
});
/*
// --- EFECTO LLUVIA JAPÓN EN TODAS LAS PANTALLAS ---
function iniciarLluviaJapon() {
    const emojis = ['🌸', '⛩️', '🍣', '🏮', '🗻', '🏯', '🎋', '🍡'];
    
    setInterval(() => {
        // Creamos el elemento
        const elemento = document.createElement('div');
        elemento.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        elemento.classList.add('emoji-cayendo');
        
        // Posición horizontal aleatoria (de 0% a 100% de la pantalla)
        elemento.style.left = Math.random() * 100 + 'vw';
        
        // Velocidad aleatoria de caída (entre 4 y 8 segundos)
        elemento.style.animationDuration = Math.random() * 4 + 4 + 's'; 
        
        // Tamaño aleatorio para dar profundidad
        elemento.style.fontSize = (Math.random() * 1 + 1) + 'rem';
        
        document.body.appendChild(elemento);
        
        // Limpiamos el emoji después de 8 segundos para no consumir memoria
        setTimeout(() => {
            elemento.remove();
        }, 8000);
        
    }, 600); // Cae un emoji nuevo cada 600 milisegundos (ajustalo para más o menos lluvia)
}
*/