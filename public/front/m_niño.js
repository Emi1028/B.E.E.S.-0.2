// Funcionalidad para custom selects
function setupCustomSelect(selectElement) {
    const display = selectElement.querySelector('.custom-select-display');
    const options = selectElement.querySelectorAll('.custom-option');
    const hiddenInput = selectElement.parentElement.querySelector('input[type="hidden"]');
    
    display.addEventListener('click', () => {
        selectElement.classList.toggle('active');
        // Cerrar otros selects
        document.querySelectorAll('.custom-select.active').forEach(el => {
            if (el !== selectElement) el.classList.remove('active');
        });
    });
    
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            // Actualizar display
            display.textContent = text;
            
            // Actualizar valor en input hidden
            if (hiddenInput) {
                hiddenInput.value = value;
            }
            
            // Marcar como seleccionado
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Cerrar dropdown
            selectElement.classList.remove('active');
            
            // Disparar evento personalizado
            const event = new Event('change', { bubbles: true });
            if (hiddenInput) hiddenInput.dispatchEvent(event);
        });
    });
}

// Cerrar dropdowns al hacer click fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select.active').forEach(el => {
            el.classList.remove('active');
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const dialogPerfil = document.getElementById('Agregar-perfiles');
    const formPerfil = document.querySelector('form[name="crearPerfil"]');
    const tdahSelect = document.getElementById('tdah-select');
    const tipoTdahSelect = document.getElementById('tipo-tdah-select');
    const tipoTdahContainer = document.getElementById('tipo-tdah-container');
    const reconoceNumerosSelect = document.getElementById('reconoce-numeros-select');
    const operacionesContainer = document.getElementById('operaciones-matematicas-container');
    
    // Configurar custom selects
    setupCustomSelect(tdahSelect);
    setupCustomSelect(tipoTdahSelect);
    setupCustomSelect(document.getElementById('concentracion-select'));
    setupCustomSelect(document.getElementById('sabe-leer-select'));
    setupCustomSelect(document.getElementById('sabe-escribir-select'));
    setupCustomSelect(reconoceNumerosSelect);
    setupCustomSelect(document.getElementById('sumas-select'));
    setupCustomSelect(document.getElementById('restas-select'));
    setupCustomSelect(document.getElementById('nivel-matematico-select'));
    
    // Mostrar/ocultar campo tipo_tdah según selección de TDAH
    const tdahHiddenInput = tdahSelect.parentElement.querySelector('input[name="tiene_tdah"]');
    if (tdahHiddenInput) {
        tdahHiddenInput.addEventListener('change', (e) => {
            if (e.target.value === 'si') {
                tipoTdahContainer.style.display = 'block';
            } else {
                tipoTdahContainer.style.display = 'none';
                const tipoTdahHiddenInput = tipoTdahSelect.parentElement.querySelector('input[name="tipo_tdah"]');
                if (tipoTdahHiddenInput) tipoTdahHiddenInput.value = '';
            }
        });
    }
    
    // Mostrar/ocultar operaciones matemáticas según selección de números
    const reconoceNumerosInput = reconoceNumerosSelect.parentElement.querySelector('input[name="reconoce_numeros"]');
    if (reconoceNumerosInput) {
        reconoceNumerosInput.addEventListener('change', (e) => {
            if (e.target.value === 'si') {
                operacionesContainer.style.display = 'block';
            } else {
                operacionesContainer.style.display = 'none';
                // Limpiar valores de sumas y restas
                formPerfil.querySelector('input[name="puede_sumar"]').value = '';
                formPerfil.querySelector('input[name="puede_restar"]').value = '';
            }
        });
    }
    
    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const n_nombre = formPerfil.querySelector('input[name="n_nombre"]').value;
            const tiene_tdah = formPerfil.querySelector('input[name="tiene_tdah"]').value;
            const tipo_tdah = formPerfil.querySelector('input[name="tipo_tdah"]').value;
            const dificultad_concentracion = formPerfil.querySelector('input[name="dificultad_concentracion"]').value;
            const sabe_leer = formPerfil.querySelector('input[name="sabe_leer"]').value;
            const sabe_escribir = formPerfil.querySelector('input[name="sabe_escribir"]').value;
            const reconoce_numeros = formPerfil.querySelector('input[name="reconoce_numeros"]').value;
            const puede_sumar = formPerfil.querySelector('input[name="puede_sumar"]').value;
            const puede_restar = formPerfil.querySelector('input[name="puede_restar"]').value;
            const nivel_matematico = formPerfil.querySelector('input[name="nivel_matematico"]').value;
            
            if (!n_nombre.trim()) {
                return alert("El nombre no puede estar vacío");
            }
            
            if (!tiene_tdah) {
                return alert("Por favor selecciona si el niño tiene diagnóstico de TDAH");
            }
            
            if (tiene_tdah === 'si' && !tipo_tdah) {
                return alert("Por favor selecciona el tipo de TDAH");
            }
            
            if (!dificultad_concentracion) {
                return alert("Por favor responde la pregunta de concentración");
            }
            
            if (!sabe_leer) {
                return alert("Por favor responde si sabe leer");
            }
            
            if (!sabe_escribir) {
                return alert("Por favor responde si sabe escribir");
            }
            
            if (!reconoce_numeros) {
                return alert("Por favor responde si reconoce números");
            }
            
            if (reconoce_numeros === 'si') {
                if (!puede_sumar) {
                    return alert("Por favor responde si puede realizar sumas");
                }
                if (!puede_restar) {
                    return alert("Por favor responde si puede realizar restas");
                }
            }
            
            if (!nivel_matematico) {
                return alert("Por favor selecciona el nivel matemático");
            }
            
            const datosFormulario = {
                n_nombre,
                tiene_tdah,
                tipo_tdah: tipo_tdah || null,
                dificultad_concentracion,
                sabe_leer,
                sabe_escribir,
                reconoce_numeros,
                puede_sumar: puede_sumar || null,
                puede_restar: puede_restar || null,
                nivel_matematico
            };
            
            try {
                console.log('Enviando datos para crear perfil:', datosFormulario);
                const response = await fetch('/api/CrearPerfil', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(datosFormulario)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Perfil creado exitosamente');
                    formPerfil.reset();
                    dialogPerfil.close();
                    checkSession();
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
        // Mostrar el contenido con fade-in
        bt.style.opacity = '1';
        actializarPerfilesNiños();
    }
}
async function fetchChildren() {
    try {
        const response = await fetch('/api/ObtenerNinos', {
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
    const response = await fetchChildren();
    console.log('Datos de niños:', response);
    const childrenData = response.niños || [];
    
    // Limpiar solo las cards de niños existentes, mantener el botón agregar
    const existingCards = contenedorCard.querySelectorAll('.child-card');
    existingCards.forEach(card => card.remove());
    
    // Dibujar todas las cards de los niños
    for (const niño of childrenData) {
        console.log('Niño individual:', niño);
        const card = document.createElement('div');
        card.className = 'bg-[var(--white)] border-[5px] rounded-lg shadow py-24 sm:py-24 md:py-24 lg:py-24 text-center justify-center items-center flex flex-col font-bold text-2xl child-card';

        card.innerHTML = `
            <div class="w-24 h-24 mb-2 rounded-full overflow-hidden border-2 border-[var(--gray-light)]">
                <svg width="100%" height="100%" class="text-[var(--gray-medium)] hover:text-[var(--gray-light)]">
                    <use xlink:href="../assets/sprite.svg#avatar"/>
                </svg>
            </div>
            <div class="flex flex-col items-center">
                <h2 class="font-bold mb-2 text-[var(--black)]">${niño.n_nombre}</h2>
            </div>
            <div class="flex flex-col gap-4 mt-4">
                <a href="Ver_niño/?id=${niño.id_niño}" class="bg-[var(--primary)] hover:bg-[var(--gradient-blue-mid)] transition-all duration-300 ease-in-out hover:-translate-y-1 
                    text-[var(--Twhite)] font-bold py-1 px-4 sm:px-6 md:px-8 mt-0 rounded-full justify-center items-center font-sans pb-3">
                    Ver Perfil
                </a>
                <button class="load eliminar-perfil bg-[var(--accent-red)] hover:bg-[var(--accent-red-hover)] transition-all duration-300 ease-in-out hover:-translate-y-1 
                    text-[var(--Twhite)] font-bold py-1 px-4 sm:px-6 md:px-8 mt-0 rounded-full justify-center items-center font-sans pb-3" data-id="${niño.id_niño}">Eliminar Perfil</button>
            </div>
        `;
        // Insertar antes del botón "Agregar Perfil"
        const addButton = contenedorCard.querySelector('button[commandfor="Agregar-perfiles"]');
        if (addButton) {
            contenedorCard.insertBefore(card, addButton);
        } else {
            contenedorCard.appendChild(card);
        }
    }
    
    // Ocultar botón de agregar si ya hay 3 perfiles
    const addButton = contenedorCard.querySelector('button[commandfor="Agregar-perfiles"]');
    if (addButton) {
        if (childrenData.length >= 3) {
            addButton.style.display = 'none';
        } else {
            addButton.style.display = 'flex';
        }
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
        } else {
            // Usuario no autenticado - mostrar pantalla de error con fade-in
            console.log('Usuario no autenticado - mostrando pantalla de acceso restringido');
            const mainElement = document.getElementById('main');
            if (mainElement) {
                mainElement.style.opacity = '1';
            }
        }
    } catch (error) {
        console.error('Error verificando sesión:', error);
        // En caso de error, también mostrar el contenido
        const mainElement = document.getElementById('main');
        if (mainElement) {
            mainElement.style.opacity = '1';
        }
    }
}