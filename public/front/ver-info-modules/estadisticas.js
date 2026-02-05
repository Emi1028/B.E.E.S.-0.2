// estadisticas.js - Sistema de gráficos para B.E.E.S.

// Configuración de colores para el gráfico
const COLORES_GRAFICO = {
    fondo: [
        'rgba(79, 177, 157, 0.7)', 'rgba(154, 197, 229, 0.7)', 'rgba(237, 206, 122, 0.7)',
        'rgba(201, 140, 154, 0.7)', 'rgba(229, 198, 195, 0.7)', 'rgba(215, 169, 175, 0.7)',
        'rgba(117, 187, 193, 0.7)', 'rgba(79, 177, 157, 0.5)', 'rgba(154, 197, 229, 0.5)',
        'rgba(237, 206, 122, 0.5)'
    ],
    borde: [
        'rgba(79, 177, 157, 1)', 'rgba(154, 197, 229, 1)', 'rgba(237, 206, 122, 1)',
        'rgba(201, 140, 154, 1)', 'rgba(229, 198, 195, 1)', 'rgba(215, 169, 175, 1)',
        'rgba(117, 187, 193, 1)', 'rgba(79, 177, 157, 1)', 'rgba(154, 197, 229, 1)',
        'rgba(237, 206, 122, 1)'
    ]
};

let myChart;

// Función para cargar datos de tiempo de juegos
async function cargarEstadisticasJuegos(idNino) {
    const ctxElement = document.getElementById('myChart');
    if (!ctxElement) {
        console.error('No se encontró el elemento canvas con id myChart');
        return;
    }

    const datos = await fetchConValidacion(`/api/estadisticas-juegos/${idNino}`);
    
    if (!datos || datos.length === 0) {
        console.log('No hay datos de estadísticas disponibles');
        ctxElement.parentElement.innerHTML = '<p class="text-center text-gray-600 py-8">No hay datos de juegos disponibles aún</p>';
        return;
    }

    const ctx = ctxElement.getContext('2d');
    
    if (myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.map(item => item.nombre_juego || 'Sin nombre'),
            datasets: [{
                label: 'Puntaje máximo',
                data: datos.map(item => parseInt(item.puntaje) || 0),
                backgroundColor: COLORES_GRAFICO.fondo,
                borderColor: COLORES_GRAFICO.borde,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 12 }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 12 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { 
                        font: { size: 14 }, 
                        padding: 15 
                    }
                },
                title: {
                    display: true,
                    text: 'Puntajes Máximos por Juego',
                    font: { size: 18, weight: 'bold' },
                    padding: { top: 10, bottom: 20 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed.y || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `Puntaje: ${value} puntos (${percentage}% del total)`;
                        }
                    }
                }
            }
        }
    });
    
    console.log('Gráfico cargado exitosamente con', datos.length, 'juegos');
}

// Exponer funciones globalmente
window.cargarEstadisticasJuegos = cargarEstadisticasJuegos;
window.myChart = myChart;
