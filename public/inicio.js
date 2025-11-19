const carousel = document.getElementById('carousel');
const slides = carousel.children;
const totalSlides = slides.length;
const slideWidth = slides[0].offsetWidth + 16;
let index = 0;
let isResetting = false;
function nextSlide() {
    if (isResetting) return;
    index++;
    if (index >= totalSlides - 1) {
        carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
        isResetting = true;
        setTimeout(() => {
            carousel.scrollTo({ left: 0, behavior: 'smooth' }); // salto invisible(no funciona)
            index = 0;
            isResetting = false;
        }, 600);
    } else {
        carousel.scrollTo({ left: index * slideWidth, behavior: 'smooth' });
    }
}
setInterval(nextSlide, 2000);

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
    // Ocultar botones de login/registro y mostrar datos del usuario
    const btnIniciarSesion = document.getElementById('si');
    if (btnIniciarSesion) {
        btnIniciarSesion.textContent = `Hola, ${usuario.nombre}`;
        btnIniciarSesion.onclick = () => logout();
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