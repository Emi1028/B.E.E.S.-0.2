document.addEventListener('DOMContentLoaded', () => {
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
                        <svg width="full" height="full" class="text-[var(--gray-medium)] hover:text-[var(--gray-light)]">
                            <use xlink:href="../assets/sprite.svg#avatar"/>
                        </svg>
                    </button>
                    <div id="dropdown" class="hidden absolute right-0 top-full mt-2 mr-2 w-64 bg-[var(--dialog-fondo)] text-[var(--Twhite)] rounded-xl shadow-xl p-3 space-y-2 z-50">
                        <a href="../Perfil/" id="perfil" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Perfil</a>
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
                <div class="md:col-span-2 bg-[var(--blue-wool)] border-[3px] rounded-lg shadow p-4">
                    <spam class="block w-full text-left mb-4">
                        <button id="ver-niños" class="bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200">
                            Ver Niños
                        </button>
                    </spam>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <!-- Aquí se agregarán los niños dinámicamente -->
                        <div class="bg-white p-36">hola</div>
                        <div class="bg-white p-36">hola</div>
                        <div class="bg-white p-36">hola</div>
                        <div class="bg-white p-36">hola</div>
                        <div class="bg-white p-36">hola</div>
                        <div class="bg-white p-36">hola</div>
                    </div>
                </div>
            </main>`;
        // Usar setTimeout para asegurar que el DOM esté actualizado
        setTimeout(() => {
            const btn_ver = document.getElementById('ver-niños');
            if (btn_ver) {
                btn_ver.addEventListener('click', (e) => {
                    window.location.href = '../menu-niños/';
                });
            }
        }, 0);
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