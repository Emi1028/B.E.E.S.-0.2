document.addEventListener('DOMContentLoaded', checkSession);

function updateUIForLoggedUser(usuario) {
    if (window.renderNavbar) window.renderNavbar(usuario);
    
    const idNiño = obtenerIdNiñoDeURL();
    if (idNiño) cargarDatosNiñoYActualizarUI(idNiño);
}

function formObjetivos() {
    const idNiño = obtenerIdNiñoDeURL();
    if(!idNiño) return;
    
    const form = document.getElementById('objetivos-form');
    if(!form) return;
    
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Verificar límite de objetivos
        const dataActual = await fetchConValidacion(`/api/ObtenerObjetivos/${idNiño}`);
        if(dataActual?.objetivos?.length >= 3) {
            return alert('Máximo 3 objetivos permitidos');
        }
        
        const textoObjetivo = form.querySelector('#nuevo-objetivo').value.trim();
        if(!textoObjetivo) return alert('El objetivo no puede estar vacío');
        
        const data = await fetchConValidacion('/api/CrearObjetivo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_niño: idNiño, texto_objetivo: textoObjetivo })
        });
        
        if(data?.success) {
            form.reset();
            cargarObjetivos(idNiño);
        } else {
            alert(data?.message || 'Error al crear objetivo');
        }
    };
    
    cargarObjetivos(idNiño);
}

// Cargar y mostrar objetivos
async function cargarObjetivos(idNiño) {
    const contenedor = document.getElementById('lista-objetivos');
    if(!contenedor) return;
    
    const data = await fetchConValidacion(`/api/ObtenerObjetivos/${idNiño}`);
    
    // Controlar formulario según cantidad de objetivos
    const form = document.getElementById('objetivos-form');
    const input = document.getElementById('nuevo-objetivo');
    const btnAgregar = document.getElementById('agregar-objetivo');
    
    if(data?.success && data.objetivos.length >= 3) {
        if(input) input.disabled = true;
        if(btnAgregar) btnAgregar.disabled = true;
        if(input) input.placeholder = 'Máximo 3 objetivos alcanzado';
    } else {
        if(input) input.disabled = false;
        if(btnAgregar) btnAgregar.disabled = false;
        if(input) input.placeholder = 'Agregar nuevo objetivo';
    }
    
    if(!data?.success || data.objetivos.length === 0) {
        contenedor.innerHTML = '<p class="text-lg text-gray-600">Lista de objetivos vacía</p>';
        return;
    }
    contenedor.innerHTML = data.objetivos.map(obj => `
        <div class="bg-white p-4 rounded-lg mb-3 flex justify-between items-center shadow ${obj.completado ? 'border-2 border-green-500 bg-green-50' : ''}">
            <div class="flex items-center align-center gap-4">
                <span class="text-3xl">
                    ${obj.completado ? '✅' : '⬜'}
                </span>
                <p class="text-lg font-semibold ${obj.completado ? 'text-green-700 line-through' : 'text-gray-800'}">${obj.texto_objetivo}</p>
                <p class="text-sm text-gray-500">Creado: ${new Date(obj.fecha_creacion).toLocaleDateString()}</p>
                ${obj.completado ? '<span class="text-xs text-green-600 font-bold">COMPLETADO</span>' : ''}
            </div>
            ${!obj.completado ? `
                <button class="eliminar-objetivo bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] text-white px-4 py-2 rounded-full transition-colors duration-200" data-id="${obj.id_objetivo}">
                    Eliminar
                </button>
            ` : '<span class="text-gray-400 text-sm italic">No se puede eliminar</span>'}
        </div>
    `).join('');
    
    // Event delegation solo para eliminar
    contenedor.onclick = async (e) => {
        // Eliminar objetivo
        if(e.target.classList.contains('eliminar-objetivo')) {
            if(!confirm('¿Estás seguro de eliminar este objetivo?')) return;
            
            const result = await fetchConValidacion(`/api/EliminarObjetivo/${e.target.dataset.id}`, {
                method: 'DELETE'
            });
            
            if(result?.success) {
                cargarObjetivos(idNiño);
            } else {
                alert(result?.message || 'Error al eliminar objetivo');
            }
        }
    };
}

// Obtener ID del niño desde la URL
const obtenerIdNiñoDeURL = () => new URLSearchParams(window.location.search).get('id');

// Realizar fetch con validación
async function fetchConValidacion(url, opciones = {}) {
    try {
        const response = await fetch(url, { credentials: 'include', ...opciones });
        if (!response.ok) {
            console.error(`Error en ${url}:`, response.status);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en petición a ${url}:`, error);
        return null;
    }
}

// Renderizar diferentes vistas según la sección
function renderSeccion(nombreNiño, seccion) {
    const secciones = {
        estadisticas: `
            <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Estadísticas de ${nombreNiño}</h3>
            <p class="text-center text-[var(--gray-medium)] mb-8">Visualiza el tiempo dedicado a cada actividad lúdica</p>
            <div class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] rounded-xl p-6 shadow-[0_4px_10px_rgba(0,0,0,0.3)] max-w-2xl mx-auto">
                <canvas id="myChart" style="max-height: 400px;"></canvas>
            </div>`,
        informacion: `
            <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Información de ${nombreNiño}</h3>
            <p class="text-center text-[var(--gray-medium)] mb-8">Datos personales y configuración</p>
            <div class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] p-6 rounded-xl shadow-md">
                <p class="text-xl mb-4">Nombre: <strong>${nombreNiño}</strong></p>
                <p class="text-lg text-gray-600">Aquí puedes agregar más información del niño</p>
            </div>`,
        objetivos: `
            <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Objetivos de ${nombreNiño}</h3>
            <p class="text-center text-[var(--gray-medium)] mb-2">Metas y objetivos del niño</p>
            <p class="text-center text-[var(--gray-medium)] mb-8">Aqui puede definir que objetivos debe cumplir el niños</p>
            <p class="text-center text-[var(--gray-medium)] mb-8">simpre debe colocar 3 objetivos para la racha</p>
            <form id="objetivos-form" class="w-full grid grid-cols-6 mb-6">
                <input id="nuevo-objetivo" type="text" placeholder="Agregar nuevo objetivo" class="col-span-5"/>
                <button id="agregar-objetivo"  type="submit" class="bg-[var(--primary)] text-white px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200">Agregar Objetivo</button>
            </form>
            <div id="lista-objetivos" class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] p-6 rounded-xl shadow-md">
            </div>`,
        racha: `
            <h3 class="text-2xl font-bold text-[var(--teal-wool)] mb-4 text-center">🔥 Racha de ${nombreNiño}</h3>
            <div class="bg-white rounded-xl p-4 max-w-xl mx-auto shadow-lg">
                <!-- Estadísticas -->
                <div class="flex justify-around mb-4 p-3 bg-gray-100 rounded-lg">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-[var(--primary)]" id="streak">0</div>
                        <div class="text-[10px] text-gray-600">Racha Actual</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-[var(--primary)]" id="total">0</div>
                        <div class="text-[10px] text-gray-600">Total Días</div>
                    </div>
                </div>

                <!-- Controles del calendario -->
                <div class="flex justify-between items-center mb-3">
                    <button id="prev-month" class="bg-[var(--accent-red)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--accent-red-hover)] transition-all text-xs font-medium">◀</button>
                    <div class="text-sm font-bold text-gray-800" id="month-year"></div>
                    <button id="next-month" class="bg-[var(--accent-red)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--accent-red-hover)] transition-all text-xs font-medium">▶</button>
                </div>

                <!-- Calendario -->
                <div class="grid grid-cols-7 gap-1.5" id="calendar-container"></div>
            </div>`,
        juegos: `
            <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Juegos de ${nombreNiño}</h3>
            <p class="text-center text-[var(--gray-medium)] mb-8">Accede a los juegos educativos</p>
            <div class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] p-6 rounded-xl shadow-md">
                <p class="text-lg text-gray-600">Catálogo de juegos próximamente...</p>
            </div>`
    };
    
    return secciones[seccion] || secciones.estadisticas;
}

// Cambiar sección sin recargar la página
function cambiarSeccion(seccion, nombreNiño) {
    const contentSection = document.getElementById('content-section');
    if (!contentSection) return;
    
    contentSection.innerHTML = renderSeccion(nombreNiño, seccion);
    
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
    
    // Si es la sección de estadísticas, cargar el gráfico
    if (seccion === 'estadisticas') {
        const idNiño = obtenerIdNiñoDeURL();
        if (idNiño) setTimeout(() => cargarEstadisticasJuegos(idNiño), 100);
    }
    
    // Si es la sección de objetivos, configurar el formulario
    if (seccion === 'objetivos') {
        formObjetivos();
    }

    // Si es la sección de racha, inicializar el calendario
    if (seccion === 'racha') {
        const idNiño = obtenerIdNiñoDeURL();
        if (idNiño) initCalendario(idNiño);
    }
}

async function cargarDatosNiñoYActualizarUI(idNiño) {
    const data = await fetchConValidacion(`/api/ObtenerNino/${idNiño}`);
    if (!data?.success || !data?.niño) return;

    const nombreNiño = data.niño.n_nombre;
    const mainElement = document.getElementById('main');
    
    if (!mainElement) return;
    
    mainElement.innerHTML = `
        <main>
            <div class="text-center grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-2">
                <div class="max-h-80 grid grid-cols-1 items-center md:col-span-1 bg-[var(--blue-wool)] border-[5px] rounded-lg shadow p-4 gap-2">
                    <a href="../../menu-niños/" class="bg-[var(--accent-red)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--accent-red-hover)] transition-colors duration-200">volver</a>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="estadisticas">Estadísticas</button>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="informacion">Información</button>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="objetivos">Objetivos</button>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="racha">Racha</button>
                    <button class="btn-seccion bg-[var(--primary)] text-white font-extrabold px-4 py-2 rounded-full hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200" data-seccion="juegos">Juegos</button>
                </div>
                <section id="content-section" class="col-span-5 bg-[var(--white)] rounded-2xl shadow-xl p-8 border-[5px] border-[var(--black)]">
                    ${renderSeccion(nombreNiño, 'estadisticas')}
                </section>
            </div>
        </main>`;
    
    // Agregar event listeners a los botones
    document.querySelectorAll('.btn-seccion').forEach(btn => {
        btn.addEventListener('click', () => {
            const seccion = btn.getAttribute('data-seccion');
            cambiarSeccion(seccion, nombreNiño);
        });
    });
    
    // Marcar estadísticas como activa por defecto
    const btnEstadisticas = document.querySelector('[data-seccion="estadisticas"]');
    if (btnEstadisticas) {
        btnEstadisticas.classList.remove('bg-[var(--primary)]');
        btnEstadisticas.classList.add('bg-[var(--accent-red)]');
    }
    
    cargarEstadisticasJuegos(idNiño);
}

async function checkSession() {
    const data = await fetchConValidacion('/api/session');
    if (data?.autenticado) updateUIForLoggedUser(data.usuario);
}