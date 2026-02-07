document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

// Renderizar diferentes vistas según la sección
function renderSeccion(usuario, seccion) {
    const nombreUsuario = usuario.u_nombre || 'Usuario';
    const secciones = {
        informacion: `
            <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Información de ${nombreUsuario}</h3>
            <p class="text-center text-[var(--gray-medium)] mb-8">Datos personales y configuración</p>
            <div class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] p-6 rounded-xl shadow-md">
                <p class="text-xl mb-4">Usuario: <strong>${nombreUsuario}</strong></p>
                <p class="text-xl mb-4">ID: <strong>${usuario.id}</strong></p>
                ${usuario.telefono ? `<p class="text-xl mb-4">Teléfono: <strong>${usuario.telefono}</strong></p>` : ''}
            </div>`,
        personalizacion: `
            <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Personalización de ${nombreUsuario}</h3>
            <p class="text-center text-[var(--gray-medium)] mb-8">Ajustes de apariencia y preferencias</p>
            <div class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] p-6 rounded-xl shadow-md">
                <p class="text-xl mb-4">Cambiar foto de perfil</p>
                <p class="text-xl mb-4">Seleccionar tema de color</p>
                <p class="text-xl mb-4">todabia enproceso</p>
            </div>`,
    };
    
    return secciones[seccion] || secciones.informacion;
}

// Cambiar sección sin recargar la página
function cambiarSeccion(seccion, usuario) {
    const contentSection = document.getElementById('content-section');
    if (!contentSection) return;
    
    contentSection.innerHTML = renderSeccion(usuario, seccion);
    
    // Actualizar botones activos
    document.querySelectorAll('.btn-seccion').forEach(btn => {
        btn.classList.remove('bg-[var(--accent-red)]', 'bg-[var(--accent-red-hover)]');
        btn.classList.add('bg-[var(--primary)]');
    });
    
    const btnActivo = document.querySelector(`[data-seccion="${seccion}"]`);
    if (btnActivo) {
        btnActivo.classList.remove('bg-[var(--primary)]');
        btnActivo.classList.add('bg-[var(--accent-red)]');
    }
}

function updateUIForLoggedUser(usuario) {
    // Actualizar navbar usando DOM_nav.js
    if (window.renderNavbar) {
        window.renderNavbar(usuario);
    }
    
    const mainElement = document.getElementById('main');
    if (!mainElement) return;
    
    mainElement.innerHTML = `
        <main>
            <div class="text-center grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-2">
                <div class="max-h-80 grid grid-cols-1 items-center md:col-span-1 bg-[var(--blue-wool)] border-[5px] rounded-lg shadow p-4 gap-2">
                    <a href="../../menu-niños/" class="bg-[var(--accent-red)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--accent-red-hover)] transition-colors duration-200">volver</a>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="informacion">Información</button>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="personalizacion">Personalización</button>
                </div>
                <section id="content-section" class="col-span-5 bg-[var(--white)] rounded-2xl shadow-xl p-8 border-[5px] border-[var(--black)]">
                    ${renderSeccion(usuario, 'informacion')}
                </section>
            </div>
        </main>`;
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-seccion').forEach(btn => {
        btn.addEventListener('click', () => {
            const seccion = btn.getAttribute('data-seccion');
            cambiarSeccion(seccion, usuario);
        });
    });
    
    // Marcar información como activa por defecto
    const btnInformacion = document.querySelector('[data-seccion="informacion"]');
    if (btnInformacion) {
        btnInformacion.classList.remove('bg-[var(--primary)]');
        btnInformacion.classList.add('bg-[var(--accent-red)]');
    }
    
    // Mostrar el contenido con fade-in
    mainElement.style.opacity = '1';
}

async function checkSession() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (data.autenticado) {
            // Usuario autenticado - actualizar interfaz
            updateUIForLoggedUser(data.usuario);
        } else {
            // Usuario no autenticado - mostrar pantalla de error con fade-in
            console.log('Usuario no autenticado - mostrando pantalla de acceso restringido');
            const mainElement = document.getElementById('main');
            if (mainElement) {
                mainElement.style.opacity = '1';
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        const mainElement = document.getElementById('main');
        if (mainElement) {
            mainElement.style.opacity = '1';
        }
    }
}