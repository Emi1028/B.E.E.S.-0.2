const ctx = document.getElementById('myChart').getContext('2d');
let myChart;

// Función para cargar datos de panes más vendidos
async function cargarEstadisticasPedidos() {
    try {
        const response = await fetch('/api/estadisticas-pedidos');
        const datos = await response.json();
        
        // Extraer nombres y cantidades
        const nombresPanes = datos.map(item => item.nombre_pan);
        const cantidadesVendidas = datos.map(item => parseInt(item.total_vendido) || 0);
        const ingresosGenerados = datos.map(item => parseFloat(item.total_ingresos) || 0);
        
        // Crear colores dinámicos para cada pan
        const coloresFondo = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(83, 102, 255, 0.6)',
            'rgba(255, 99, 255, 0.6)',
            'rgba(99, 255, 132, 0.6)'
        ];
        
        const coloresBorde = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(255, 99, 255, 1)',
            'rgba(99, 255, 132, 1)'
        ];
        
        // Crear o actualizar el gráfico
        if (myChart) {
            myChart.destroy();
        }
        
        myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: nombresPanes,
                datasets: [{
                    label: 'Unidades vendidas',
                    data: cantidadesVendidas,
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
                        text: 'Panes Más Vendidos',
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
                                return label + ': ' + value + ' unidades (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}
// Cargar datos al iniciar
cargarEstadisticasPedidos();