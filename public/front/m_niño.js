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
                console.log('Enviando datos para crear perfil:', { n_nombre });
                const response = await fetch('/api/CrearPerfil', {
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
    checkSession();
});

function updateUIForLoggedUser(usuario) {
    // Actualizar navbar usando DOM_nav.js
    if (window.renderNavbar) {
        window.renderNavbar(usuario);
    }
    
    const bt = document.getElementById('main');
    //boton ver niños
    if (bt) {
        bt.innerHTML = ``;
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
        const response = await fetch('/api/ObtenerNiños', {
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
    const childrenData = (await fetchChildren()).ninos;
    console.log('Datos de niños:', childrenData);
    // 1. Limpiar el contenedor si ya hay 3 cards
    if (childrenData.length === 3) {
        contenedorCard.innerHTML = "";
    }
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
            <a href="Ver_niño/" id="ver-niños" class="bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] transition-all duration-300 ease-in-out hover:-translate-y-1 
                text-[var(--Twhite)] font-bold py-1 px-4 sm:px-6 md:px-8 mt-0 rounded-full justify-center items-center font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl pb-3">
                Ver Perfil
            </a>
        `;
        contenedorCard.appendChild(card);
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
        const res = await fetch(`/api/EliminarPerfil/${id}`, { 
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