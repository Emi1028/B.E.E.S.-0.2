document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    cargarEstadisticasJuegos();
});

const ctx = document.getElementById('myChart').getContext('2d');
let myChart;

// Función para cargar datos de tiempo de juegos
async function cargarEstadisticasJuegos() {
    try {
        const response = await fetch('/api/estadisticas-juegos');
        const datos = await response.json();
        
        // Extraer nombres de juegos y tiempos
        const nombresJuegos = datos.map(item => item.nombre_juego);
        const tiemposJuegos = datos.map(item => parseInt(item.tiempo_jugado) || 0);
        
        // Colores de la paleta "Wrapped in Wool"
        const coloresFondo = [
            'rgba(79, 177, 157, 0.7)',    // --teal-wool
            'rgba(154, 197, 229, 0.7)',   // --blue-wool
            'rgba(237, 206, 122, 0.7)',   // --yellow-wool
            'rgba(201, 140, 154, 0.7)',   // --mauve-wool
            'rgba(229, 198, 195, 0.7)',   // --pink-wool
            'rgba(215, 169, 175, 0.7)',   // --pink
            'rgba(117, 187, 193, 0.7)',   // --gradient-blue-mid
            'rgba(79, 177, 157, 0.5)',    // --teal-wool (más claro)
            'rgba(154, 197, 229, 0.5)',   // --blue-wool (más claro)
            'rgba(237, 206, 122, 0.5)'    // --yellow-wool (más claro)
        ];
        
        const coloresBorde = [
            'rgba(79, 177, 157, 1)',      // --teal-wool
            'rgba(154, 197, 229, 1)',     // --blue-wool
            'rgba(237, 206, 122, 1)',     // --yellow-wool
            'rgba(201, 140, 154, 1)',     // --mauve-wool
            'rgba(229, 198, 195, 1)',     // --pink-wool
            'rgba(215, 169, 175, 1)',     // --pink
            'rgba(117, 187, 193, 1)',     // --gradient-blue-mid
            'rgba(79, 177, 157, 1)',      // --teal-wool
            'rgba(154, 197, 229, 1)',     // --blue-wool
            'rgba(237, 206, 122, 1)'      // --yellow-wool
        ];
        
        // Crear o actualizar el gráfico
        if (myChart) {
            myChart.destroy();
        }
        
        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: nombresJuegos,
                datasets: [{
                    label: 'Tiempo jugado (minutos)',
                    data: tiemposJuegos,
                    backgroundColor: coloresFondo,
                    borderColor: coloresBorde,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 15
                        }
                    },
                    title: {
                        display: true,
                        text: 'Tiempo de Juego por Actividad',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ' + value + ' minutos (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error al cargar estadísticas de juegos:', error);
    }
}
// Cargar datos al iniciar
cargarEstadisticasJuegos();

function updateUIForLoggedUser(usuario) {
    // Actualizar navbar usando DOM_nav.js
    if (window.renderNavbar) {
        window.renderNavbar(usuario);
    }
    
    const bt = document.getElementById('main');
    //boton ver niños
    if (bt) {
        bt.innerHTML = `
            <main>
                
                <section class="mb-12 bg-[var(--white)] rounded-2xl shadow-xl p-8 w-full max-w-4xl ml-8 border-2 border-[var(--black)]">
                    <h3 class="text-3xl font-bold text-[var(--teal-wool)] mb-6 text-center">Estadísticas de Tiempo de Juego</h3>
                    <p class="text-center text-[var(--gray-medium)] mb-8">Visualiza el tiempo dedicado a cada actividad lúdica</p>
                    <div class="bg-gradient-to-br from-[var(--blue-wool)] to-[var(--pink-wool)] rounded-xl p-6 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                        <canvas id="myChart" class="max-w-full"></canvas>
                    </div>
                </section>
            </main>`;
        actializarPerfilesNiños();
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