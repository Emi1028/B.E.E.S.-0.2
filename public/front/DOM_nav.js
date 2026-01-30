document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('dropdown');
        const profileBtn = document.getElementById('profileBtn');

        if (!dropdown || !profileBtn) return;

        if (e.target === profileBtn || profileBtn.contains(e.target)) {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
            return;
        }

        if (!dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logoutLink') {
            e.preventDefault();
            if (window.logout) {
                window.logout();
            }
        }
    });
});

window.renderNavbar = function(usuario) {
    const nav = document.getElementById('nav');
    if (nav){
        const path = window.location.pathname;
        let basePath = './';
        let assetsPath = './assets/';
        let imgPath = './img/';
        
        if (path.includes('/Ver_ni') || path.includes('Ver_niño')) {
            basePath = '../../';
            assetsPath = '../../assets/';
            imgPath = '../../img/';
        }
        else if (path.includes('/Perfil/') || path.includes('/menu-ni')) {
            basePath = '../';
            assetsPath = '../assets/';
            imgPath = '../img/';
        }
        
        nav.innerHTML = `
        <a href="${basePath}index.html" class="flex pl-0 py-3 cursor-pointer hover:opacity-80">
            <img src="${imgPath}logo2.png" alt="logo de Swarmp" class="logo">
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
                            <use xlink:href="${assetsPath}sprite.svg#avatar"/>
                        </svg>
                    </button>
                    <div id="dropdown" class="hidden absolute right-0 top-full mt-2 mr-2 w-64 bg-[var(--dialog-fondo)] text-[var(--Twhite)] rounded-xl shadow-xl p-3 space-y-2 z-50">
                        <a href="${basePath}Perfil/" id="perfil" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Perfil</a>
                        <a href="${basePath}menu-niños/" id="btn-ver-niños" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Niños</a>
                        <hr class="border-[var(--one-esmeralda)]">
                        <a href="#" id="logoutLink" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Cerrar sesión</a>
                    </div>
                </div>
            </div>
        </div>`;
    }    
}

window.logout = async function() {
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