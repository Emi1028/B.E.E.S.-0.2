document.addEventListener('DOMContentLoaded', () => {
    // Configuración de botones para cambiar entre inicio de sesión y registro
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
                    credentials: 'include',
                    body: JSON.stringify({ u_nombre, contraseña })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Inicio de sesión exitoso');
                    dialogInicioSesion.close();
                    location.reload();
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
    // Verificar sesión al cargar la página
    checkSession();
});
function updateUIForLoggedUser(usuario) {
    window.renderNavbar(usuario);
    const bt = document.getElementById('ver-niños');
    if (bt) {
        bt.innerHTML = '';
        bt.innerHTML = `
        <a href="./menu-niños/" id="ver-niños" class="bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] transition-all duration-300 ease-in-out hover:-translate-y-1 
            text-[var(--Twhite)] font-bold py-1 px-4 sm:px-6 md:px-8 mt-0 rounded-full justify-center items-center font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl pb-3">
            Ver Niños
        </a>`;
    }
}
async function checkSession() {
    try {
        const response = await fetch('/api/session', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.autenticado && data.usuario) {
            updateUIForLoggedUser(data.usuario);
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

