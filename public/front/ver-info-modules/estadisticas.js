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
    if (!ctxElement) return;

    const datos = await fetchConValidacion(`/api/estadisticas-juegos/${idNino}`);
    if (!datos || datos.length === 0) return;

    const ctx = ctxElement.getContext('2d');
    
    if (myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: datos.map(item => item.nombre_juego),
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
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: { font: { size: 14 }, padding: 15 }
                },
                title: {
                    display: true,
                    text: 'Puntajes Máximos por Juego',
                    font: { size: 18, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} puntos (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Exponer funciones globalmente
window.cargarEstadisticasJuegos = cargarEstadisticasJuegos;
window.myChart = myChart;
