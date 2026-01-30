document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

function updateUIForLoggedUser(usuario) {
    // Actualizar navbar usando DOM_nav.js
    if (window.renderNavbar) {
        window.renderNavbar(usuario);
    }
    
    const bt = document.getElementById('main');
    if (bt) {
        bt.innerHTML = `
            <main class="font-bold text-lg">
                <div class="text-center grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    <div class="grid grid-cols-1 items-center md:col-span-1 bg-[var(--blue-wool)] border-[5px] rounded-lg shadow p-4"> <spam class="block w-auto text-left pb-3">
                        <a href="../menu-niños/" id="ver-niños" class="bg-[var(--primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] transition-colors duration-200">
                            Ver Niños
                        </a>
                        <div class="col-span-1 bg-white">hola</div>
                        <div class="bg-white">hola</div>
                        <div class="bg-white">hola</div>
                        <div class="bg-white">hola</div>
                        <div class="bg-white">hola</div>
                        <div class="bg-white">hola</div>
                        <div class="bg-white">hola</div>
                        <div class="bg-white">hola</div>
                    </div>
                    <div class="md:col-span-4 bg-[var(--blue-wool)] border-[5px] rounded-lg shadow p-4">
                        <div class="text-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
<!-- Aquí apareceran las funciones dentro de la pestaña seleccionada dinámicamente -->
                        </div>
                    </div>
                </div>
            </main>`;
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