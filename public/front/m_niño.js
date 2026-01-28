document.addEventListener('DOMContentLoaded', () => {
    const dialogPerfil = document.getElementById('Agregar-perfiles');
    const formPerfil = document.querySelector('form[name="crearPerfil"]');
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
                    checkSession(); // Recargar para actualizar la interfaz
                } else {
                    alert(data.message || 'Error al crear perfil');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        });
    }
    configurarEliminarPerfil();
    configurarDropdown();
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
                        <a href="../Perfil/" id="perfil" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Perfil</a>
                        <a href="../menu-niños/" id="btn-ver-niños" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Niños</a>
                        <hr class="border-[var(--one-esmeralda)]">
                        <a href="#" id="logoutLink" class="block px-2 py-2 rounded-lg hover:bg-[var(--gradient-blue-mid)] text-[var(--Twhite)]">Cerrar sesión</a>
                    </div>
                </div>
            </div>
        </div>`;
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
        actializarPerfilesNiños();
    }
}
async function fetchChildren() {
    try {
        const response = await fetch('http://localhost:3000/api/ObtenerNinos', {
            credentials: 'include'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, niños: [] };
    }
}
async function actializarPerfilesNiños() {
    const contenedorCard = document.getElementById('Contenedor-card');
    if (!contenedorCard) return;

    // Obtener niños del backend
    const childrenData = (await fetchChildren()).niños;
    console.log('Datos de niños:', childrenData);
    // 1. Limpiar TODO el contenedor, incluyendo el botón
    contenedorCard.innerHTML = "";

    // 2. Dibujar primero todas las cards de los niños
    for (const niño of childrenData) {
        console.log('Niño individual:', niño);
        const card = document.createElement('div');
        card.className = 'bg-[var(--white)] border-[5px] rounded-lg shadow py-28 sm:py-28 md:py-28 lg:py-52 text-center justify-center items-center flex flex-col font-bold text-2xl child-card';
        
        card.innerHTML = `
            <div class="flex flex-col items-center">
                <h2 class="font-bold mb-2 text-[var(--black)]">${niño.n_nombre}</h2>
                <button class="load eliminar-perfil" data-id="${niño.id_niño}">Eliminar Perfil</button>
            </div>
        `;

        contenedorCard.appendChild(card);
    }

    // 3. Si todavía no hay 3 perfiles → agregar botón de agregar perfil
    if (childrenData.length < 3) {
        const addButton = document.createElement('button');
        addButton.setAttribute("commandfor", "Agregar-perfiles");
        addButton.setAttribute("command", "show-modal");

        addButton.className = `
            cursor-pointer bg-[var(--pink-hover)] border-[5px] border-[var(--mauve-wool-hover)]
            rounded-lg hover:opacity-90 py-28 sm:py-28 md:py-28 lg:py-52 text-center 
            justify-center items-center flex flex-col font-bold text-[var(--mauve-wool-hover)] text-5xl
        `;

        addButton.innerHTML = `
            <div class="bg-[var(--mauve-wool-hover)] rounded-full p-2 mb-2">
                <svg width="40px" height="40px" class="text-[var(--pink-hover)]">
                    <use xlink:href="../assets/sprite.svg#plus-icon"/>
                </svg>
            </div>
            Agregar Perfil<br>de niño
        `;

        contenedorCard.appendChild(addButton);
    }
}


function configurarEliminarPerfil() {
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('eliminar-perfil')) {
      const id = e.target.getAttribute('data-id');
      console.log('ID a eliminar:', id);
      
      if (!id || id === 'undefined') {
        alert('Error: ID del perfil no válido');
        return;
      }
      
      try {
        const res = await fetch(`http://localhost:3000/api/EliminarPerfil/${id}`, { 
          method: 'DELETE',
          credentials: 'include'
        });
        const data = await res.json();

        if (data.success) {
          alert(data.message);
          checkSession();
        } else {
          alert(data.message);
        }

      } catch (error) {
        console.error(error);
        alert('Error al eliminar perfil');
      }
    }
  });
}
function configurarDropdown() {
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdown');
    const profileBtn = document.getElementById('profileBtn');

    if (!dropdown || !profileBtn) return;

    // Toggle dropdown al hacer click en el boton perfil
    if (e.target === profileBtn || profileBtn.contains(e.target)) {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
      return;
    }

    // Click afuera → cerrar
    if (!dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
  // Logout delegando evento
  document.addEventListener('click', (e) => {
    if (e.target.id === 'logoutLink') {
      e.preventDefault();
      logout();
    }
  });
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