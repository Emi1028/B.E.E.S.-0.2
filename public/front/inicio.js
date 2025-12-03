// Manejo de dialogs
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    const btnRegistro = document.getElementById('btn-registro');
    const dialogInicioSesion = document.getElementById('inicio-sesion');
    const dialogRegistro = document.getElementById('registro');

    if (btnRegistro && dialogInicioSesion && dialogRegistro) {
        btnRegistro.addEventListener('click', () => {
            dialogInicioSesion.close();
            dialogRegistro.showModal();
        });
    }
    
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin && dialogInicioSesion && dialogRegistro) {
        btnLogin.addEventListener('click', () => {
            dialogRegistro.close();
            dialogInicioSesion.showModal();
        });
    }
    
    // Manejo de inicio de sesión
    const formInicioSesion = document.querySelector('form[name="inicio-sesion"]');
    if (formInicioSesion) {
        formInicioSesion.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const u_nombre = formInicioSesion.querySelector('input[name="u_nombre"]').value;
            const contraseña = formInicioSesion.querySelector('#contraseña').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ u_nombre, contraseña })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Inicio de sesión exitoso');
                    dialogInicioSesion.close();
                    location.reload(); // Recargar para actualizar la interfaz
                } else {
                    alert(data.message || 'Error al iniciar sesión');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        });
    }
    
    // Manejo de registro
    const formRegistro = document.querySelector('form[name="registro"]');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const u_nombre = formRegistro.querySelector('input[name="u_nombre"]').value;
            const nombre = formRegistro.querySelector('input[name="nombre"]').value;
            const apellido_p = formRegistro.querySelector('input[name="apellido_p"]').value;
            const apellido_m = formRegistro.querySelector('input[name="apellido_m"]').value;
            const telefono = formRegistro.querySelector('input[name="telefono"]').value;
            const contraseña = formRegistro.querySelector('#contraseña-registro').value;
            const confirmar = formRegistro.querySelector('#confirmar').value;
            
            if(telefono.length !== 10){
                alert('El número de teléfono debe tener 10 dígitos');
                return;
            }

            if (contraseña !== confirmar) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            try {
                const response = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ u_nombre,nombre, apellido_p, apellido_m, telefono, contraseña })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Registro exitoso');
                    dialogRegistro.close();
                    location.reload(); // Recargar para actualizar la interfaz
                } else {
                    alert(data.message || 'Error al registrarse');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        });
    }
    async function checkSession() {
        try {
            const response = await fetch('/api/session', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.status === 401) {
                // No hay sesión activa, NO es un error
                return;
            }
            if (!response.ok) {
                throw new Error("Error inesperado en /api/session");
            }
            const data = await response.json();
            
            if (data.autenticado) {
                // Usuario autenticado - actualizar interfaz
                updateUIForLoggedUser(data.usuario);
            }
        } catch (error) {
            console.error('Error verificando sesión:', error);
        }
    }
    function updateUIForLoggedUser(usuario) {
        // Reemplazar todo el contenido del nav
        const nav = document.getElementById('nav');
        const bt = document.getElementById('btn-ver-niños');
        //Nueva barra superior
        if (nav) {
            nav.innerHTML = `
            <div class="flex pl-0">
                <img src="img/logo2.png" alt="logo de Swarmp" class="logo">
                <p class="hidden sm:block text-[var(--logo-color)] font- text-3xl font-bold">Swarmp</p> 
            </div>
            <div class="flex items-stretch">
                <div class="flex items-center gap-1">
                    <p class="bg-[var(--black)] text-[var(--Twhite)] border-none p-3 text-base lg:text-2xl md:text-xl font-bold m-0">
                        Hola, ${usuario.u_nombre}
                    </p>
                    <div class="relative inline-flex items-center">
                        <button id="profileBtn" class="mr-2 w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--white)] hover:border-[var(--primary)] transition-all duration-200">
                            <svg width="100%" height="100%" class="text-[var(--gray-medium)] hover:text-[var(--gray-light)]">
                                <use xlink:href="./assets/sprite.svg#avatar"/>
                            </svg>
                        </button>
                        <div id="dropdown" class="hidden absolute right-0 top-full mt-2 mr-2 w-64 bg-[var(--dialog-fondo)] text-[var(--Twhite)] rounded-xl shadow-xl p-3 space-y-2 z-50">
                            <a href="/Perfil" id="perfil" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Perfil</a>
                            <a href="menu-niños/" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Niños</a>
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
            <button id="ver-niños" class="bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] transition-all duration-300 ease-in-out hover:-translate-y-1 
                text-[var(--Twhite)] font-bold py-1 px-4 sm:px-6 md:px-8 mt-0 rounded-full justify-center items-center font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl pb-3">                    Ver Niños
            </button>`;
            // Usar setTimeout para asegurar que el DOM esté actualizado
            setTimeout(() => {
                const btn_ver = document.getElementById('ver-niños');
                if (btn_ver) {
                    btn_ver.addEventListener('click', (e) => {
                        window.location.href = 'menu-niños/';
                    });
                }
            }, 0);
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
    
    // Verificar sesión al cargar la página
    checkSession();
});

