// =====================================================
// EJEMPLO DE IMPLEMENTACIÓN EN EL FRONTEND (m_niño.js)
// =====================================================

// Ejemplo de cómo modificar el evento submit del formulario
// para incluir los datos del cuestionario

document.forms.crearPerfil.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtener el nombre
    const nombre = document.forms.crearPerfil.n_nombre.value.trim();
    
    // Obtener las respuestas del cuestionario
    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');
    const q4 = document.querySelector('input[name="q4"]:checked');
    
    // Validar que todas las preguntas fueron respondidas
    if (!q1 || !q2 || !q3 || !q4) {
        alert('Por favor responde todas las preguntas del cuestionario');
        return;
    }
    
    // Preparar los datos
    const formData = {
        n_nombre: nombre,
        q1: parseInt(q1.value),
        q2: parseInt(q2.value),
        q3: parseInt(q3.value),
        q4: parseInt(q4.value)
    };
    
    try {
        // Enviar los datos al servidor
        const response = await fetch('/perfil/CrearPerfilConCuestionario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Perfil creado exitosamente');
            
            // Cerrar el dialog
            document.getElementById('Agregar-perfiles').close();
            
            // Resetear el formulario
            document.forms.crearPerfil.reset();
            
            // Recargar la lista de perfiles (si existe la función)
            if (typeof cargarPerfiles === 'function') {
                cargarPerfiles();
            } else {
                // O recargar la página
                window.location.reload();
            }
        } else {
            alert(data.message || 'Error al crear el perfil');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

// =====================================================
// FUNCIÓN PARA OBTENER EL CUESTIONARIO DE UN NIÑO
// =====================================================

async function obtenerCuestionario(niñoId) {
    try {
        const response = await fetch(`/perfil/ObtenerCuestionario/${niñoId}`);
        const data = await response.json();
        
        if (data.success && data.cuestionario) {
            console.log('Cuestionario:', data.cuestionario);
            
            // Ejemplo de cómo usar los datos
            const { pregunta_1, pregunta_2, pregunta_3, pregunta_4 } = data.cuestionario;
            
            return {
                emocional: pregunta_1,
                abusivo: pregunta_2,
                frustracion: pregunta_3,
                sueno: pregunta_4
            };
        }
        
        return null;
        
    } catch (error) {
        console.error('Error obteniendo cuestionario:', error);
        return null;
    }
}

// =====================================================
// FUNCIÓN PARA MOSTRAR ESTADÍSTICAS DEL CUESTIONARIO
// =====================================================

async function mostrarEstadisticasCuestionario(niñoId) {
    try {
        const response = await fetch(`/perfil/EstadisticasCuestionario/${niñoId}`);
        const data = await response.json();
        
        if (data.success && data.estadisticas) {
            const stats = data.estadisticas;
            
            console.log('Estadísticas del cuestionario:');
            console.log('- Promedio emocional:', stats.promedio_emocional.toFixed(2));
            console.log('- Promedio abusivo:', stats.promedio_abusivo.toFixed(2));
            console.log('- Promedio frustración:', stats.promedio_frustracion.toFixed(2));
            console.log('- Promedio sueño:', stats.promedio_sueno.toFixed(2));
            console.log('- Promedio total:', stats.promedio_total.toFixed(2));
            
            return stats;
        }
        
        return null;
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return null;
    }
}

// =====================================================
// FUNCIÓN AUXILIAR PARA INTERPRETAR LOS VALORES
// =====================================================

function interpretarRespuesta(valor) {
    const interpretaciones = {
        0: 'Nunca',
        1: 'Sólo un poco',
        2: 'Bastante',
        3: 'Mucho'
    };
    return interpretaciones[valor] || 'Desconocido';
}

function interpretarPromedio(promedio) {
    if (promedio < 0.5) return 'Muy bajo';
    if (promedio < 1.5) return 'Bajo';
    if (promedio < 2.5) return 'Moderado';
    return 'Alto';
}

// =====================================================
// EJEMPLO DE USO
// =====================================================

// Para crear un perfil con cuestionario:
// El formulario ya está configurado en el HTML
// Solo asegúrate de que el evento submit esté correctamente implementado

// Para obtener el cuestionario de un niño:
// const cuestionario = await obtenerCuestionario(1);
// console.log('Respuesta emocional:', interpretarRespuesta(cuestionario.emocional));

// Para obtener estadísticas:
// const stats = await mostrarEstadisticasCuestionario(1);
// console.log('Nivel general:', interpretarPromedio(stats.promedio_total));
