document.addEventListener('DOMContentLoaded', () => {
    const dialogPerfil = document.getElementById('Agregar-perfiles');
    const formPerfil = document.querySelector('form[name="inicio-sesion"]');
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const n_nombre   = formPerfil.querySelector('input[name="n_nombre"]').value;
            if (!n_nombre.trim()) {
                return alert("El nombre no puede estar vacío");
            }            
            try {
                const response = await fetch('http://localhost:3000/api/CrearPerfil', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({n_nombre})
                });
                const data = await response.json();
                
                if (data.success) {
                    alert('Perfil creado exitosamente');
                    dialogPerfil.close();
                    location.reload(); // Recargar para actualizar la interfaz
                } else {
                    alert(data.message || 'Error al crear perfil');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        });
    }
    checkSession();
});

function updateUIForLoggedUser(usuario) {
    // Reemplazar todo el contenido del nav
    const nav = document.getElementById('nav');
    const bt = document.getElementById('main');
    //Nueva barra superior
    if (nav) {
        nav.innerHTML = `
        <a href="../index.html" class="flex pl-0 py-3 cursor-pointer hover:opacity-80">
            <img src="../img/logo2.png" alt="logo de Swarmp" class="logo">
            <p class="hidden sm:block text-[var(--logo-color)] font- text-3xl font-bold">Swarmp</p> 
        </a>
        <div class="flex items-stretch">
            <div class="flex items-center gap-1">
                <p class="bg-[var(--black)] text-[var(--Twhite)] border-none p-3 text-base lg:text-2xl md:text-xl font-bold m-0">
                    Hola, ${usuario.u_nombre}
                </p>
                <div class="relative inline-flex items-center">
                    <button id="profileBtn" class="mr-2 w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--white)] hover:border-[var(--primary)] transition-all duration-200">
                        <svg width="100%" height="100%" class="text-[var(--gray-medium)] hover:text-[var(--gray-light)]">
                            <use xlink:href="../assets/sprite.svg#avatar"/>
                        </svg>
                    </button>
                    <div id="dropdown" class="hidden absolute right-0 top-full mt-2 mr-2 w-64 bg-[var(--dialog-fondo)] text-[var(--Twhite)] rounded-xl shadow-xl p-3 space-y-2 z-50">
                        <a href="../Perfil" id="perfil" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Perfil</a>
                        <a href="../menu-niños/" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Niños</a>
                        <hr class="border-[var(--one-esmeralda)]">
                        <a href="#" id="logoutLink" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Cerrar sesión</a>
                    </div>
                </div>
            </div>
        </div>`;
        // Usar setTimeout para asegurar que el DOM esté actualizado
        setTimeout(() => {            
            // Funcionalidad del menú desplegable del perfil
            const profileBtn = document.getElementById('profileBtn');
            const dropdown = document.getElementById('dropdown');
            const logoutLink = document.getElementById('logoutLink');
            
            if (profileBtn && dropdown) {
                // Toggle del dropdown al hacer click en el botón de perfil
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('hidden');
                });
                
                // Cerrar el dropdown al hacer click fuera
                document.addEventListener('click', (e) => {
                    if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target)) {
                        dropdown.classList.add('hidden');
                    }
                });
            }
            // Evento del boton ver niños en el menú desplegable
            const btn_ver = document.getElementById('btn-ver-niños');
            if (btn_ver) {
                btn_ver.addEventListener('click', (e) => {
                    window.location.href = 'menu-niños/';
                });
            }
            // Evento de logout en el menú desplegable
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    logout();
                });
            }
        }, 0);
    }
    //boton ver niños
    if (bt) {
        bt.innerHTML = `
            <main>
                <div class="sm:col-span-2 bg-[var(--blue-wool)] border-[5px] rounded-lg shadow p-4">
                    <div id="Contenedor-card" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <button commandfor="Agregar-perfiles" command="show-modal" class="order-last cursor-pointer bg-[var(--pink-hover)] 
                        border-[5px] border-[var(--mauve-wool-hover)] rounded-lg hover:opacity-90 py-28 sm:py-28 md:py-28 lg:py-52 text-center 
                        justify-center items-center flex flex-col font-bold text-[var(--mauve-wool-hover)] text-5xl" >
                            <div class="bg-[var(--mauve-wool-hover)] rounded-full p-2 mb-2">
                                <svg width="40px" height="40px" class="text-[var(--pink-hover)]">
                                    <use xlink:href="../assets/sprite.svg#plus-icon"/>
                                </svg>
                            </div>
                        Agregar Perfil<br>de niño</button>
                    </div>
                </div>
            </main>`;
        // Usar setTimeout para asegurar que el DOM esté actualizado
        setTimeout(async () => {
            const contenedorCard = document.getElementById('Contenedor-card');
            const childrenData = (await fetchChildren()).niños;
            if (childrenData.length === 3) {
                contenedorCard.innerHTML = '';
            }
            // Mostrar cards
            //contenedorCard.innerHTML = '';
            for (const niño of childrenData) {
                const card = document.createElement('div');
                card.className = 'bg-[var(--white)] border-[5px] rounded-lg shadow py-28 sm:py-28 md:py-28 lg:py-52 text-center justify-center items-center flex flex-col font-bold text-2xl';
                card.innerHTML = `
                    <div class="flex flex-col items-center">
                        <!--<div class="bg-[var(--gradient-blue-start)] rounded-full p-4 mb-4">
                            <svg width="60px" height="60px" class="text-[var(--black)]">
                                <use xlink:href="../assets/sprite.svg#avatar"/>
                            </svg>
                        </div>-->
                        <h2 class="font-bold mb-2 text-[var(--black)]">${niño.n_nombre}</h2>
                        <a href="../menu-niños/?id=${niño.id_niño}" 
                            class="inline-block bg-[var(--gradient-blue-start)] text-[var(--black)] font-bold py-2 px-4 rounded-lg hover:opacity-90">
                            Ver Perfil
                        </a>
                    </div>
                `;
                contenedorCard.appendChild(card);
            }
        }, 0);
    }
}
async function fetchChildren() {
    try {
        const response = await fetch('/api/ObtenerNinos');
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, niños: [] };
    }
}

async function checkSession() {
    try {
        const response = await fetch('/api/session');
        const data = await response.json();
        
        if (data.autenticado) {
            // Usuario autenticado - actualizar interfaz
            updateUIForLoggedUser(data.usuario);
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}
async function logout() {
    try {
        const response = await fetch('/api/logout', { method: 'POST' });
        const data = await response.json();
        
        if (data.success) {
            alert('Sesión cerrada');
            location.reload();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}