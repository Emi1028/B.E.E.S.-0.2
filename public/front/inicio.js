// Manejo de dialogs
document.addEventListener('DOMContentLoaded', () => {
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
            
            const nombre = formInicioSesion.querySelector('input[name="nombre"]').value;
            const contraseña = formInicioSesion.querySelector('#contraseña').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, contraseña })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = 'exitoso/';
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
            
            const nombre = formRegistro.querySelector('input[name="nombre"]').value;
            const apellido_p = formRegistro.querySelector('input[name="apellido_p"]').value;
            const apellido_m = formRegistro.querySelector('input[name="apellido_m"]').value;
            const telefono = formRegistro.querySelector('input[name="telefono"]').value;
            const contraseña = formRegistro.querySelector('#contraseña-registro').value;
            const confirmar = formRegistro.querySelector('#confirmar').value;
            
            if (contraseña !== confirmar) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            try {
                const response = await fetch('/api/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, apellido_p, apellido_m, telefono, contraseña })
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
    
    // Verificar sesión al cargar la página
    checkSession();
});

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
function updateUIForLoggedUser(usuario) {
    // Reemplazar todo el contenido del nav
    const nav = document.getElementById('nav');
    if (nav) {
        nav.innerHTML = `
        <div class="flex pl-0">
            <img src="img/logo2.png" alt="logo de Swarmp" class="logo">
            <p class="hidden sm:block text-[#ffeb52] font- text-3xl font-bold">Swarmp</p> 
        </div>
        <div class="flex items-stretch">
            <button class="bg-[var(--black)] hover:bg-[var(--primary)] text-[var(--Twhite)] border-none p-3 text-base lg:text-2xl sm:text-base cursor-pointer transition-colors duration-200 text-center font-bold"  type="submit">Registrarse</button>
            <button class="bg-[var(--black)] hover:bg-[var(--primary)] text-[var(--Twhite)] border-none p-3 text-base lg:text-2xl sm:text-base cursor-pointer transition-colors duration-200 text-center font-bold"  type="submit">Registrarse</button>
            <button class="bg-[var(--black)] hover:bg-[var(--accent-red-hover)] text-[var(--Twhite)] border-none p-3 text-base lg:text-2xl md:text-xl cursor-pointer transition-colors duration-200 text-center font-bold"  id="si" type="submit">Hola, ${usuario.nombre}</button>
        </div>`;
        
        // Asignar el evento de logout al nuevo botón
        const btnSi = document.getElementById('si');
        if (btnSi) {
            btnSi.onclick = (e) => {
                e.preventDefault();
                logout();
            };
        }
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