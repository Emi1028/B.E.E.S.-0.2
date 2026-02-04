// racha.js - Sistema de Calendario de Racha para B.E.E.S.

// Clase para manejar el calendario de racha
class CalendarioRacha {
    constructor(idNiño) {
        this.idNiño = idNiño;
        this.date = new Date();
        this.completed = new Set();
        this.objetivosDB = [];
    }

    dateStr(y, m, d) {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    async cargarObjetivosDB() {
        const data = await fetchConValidacion(`/api/ObtenerRacha/${this.idNiño}`);
        if (data?.success && data.objetivos) {
            this.objetivosDB = data.objetivos;
        }
    }

    async cargarDiasCompletados() {
        const y = this.date.getFullYear();
        const m = this.date.getMonth();
        
        const data = await fetchConValidacion(
            `/api/ObtenerDiasCompletados/${this.idNiño}?año=${y}&mes=${m}`
        );
        
        if (data?.success) {
            this.completed = new Set(data.dias);
        }
    }

    async cargarEstadisticas() {
        const data = await fetchConValidacion(`/api/CalcularRacha/${this.idNiño}`);
        
        if (data?.success) {
            this.rachaActual = data.racha;
            this.totalDias = data.total;
        }
    }

    async verificarYActualizarRachaDiaria() {
        await fetchConValidacion(`/api/VerificarRachaDiaria/${this.idNiño}`, {
            method: 'POST'
        });
    }

    async render() {
        await this.cargarObjetivosDB();
        await this.verificarYActualizarRachaDiaria();
        await this.cargarDiasCompletados();
        await this.cargarEstadisticas();
        
        const cal = document.getElementById('calendar-container');
        const y = this.date.getFullYear();
        const m = this.date.getMonth();
        
        document.getElementById('month-year').textContent = 
            this.date.toLocaleDateString('es', { month: 'long', year: 'numeric' });
        
        cal.innerHTML = '';
        
        // Etiquetas de días
        ['D', 'L', 'M', 'X', 'J', 'V', 'S'].forEach(d => {
            const label = document.createElement('div');
            label.className = 'text-center text-[10px] font-bold text-gray-600 p-1';
            label.textContent = d;
            cal.appendChild(label);
        });

        const first = new Date(y, m, 1).getDay();
        const days = new Date(y, m + 1, 0).getDate();
        const prev = new Date(y, m, 0).getDate();
        
        // Días del mes anterior
        for (let i = first - 1; i >= 0; i--) 
            this.addDay(cal, prev - i, true, y, m - 1);
        
        // Días del mes actual
        for (let d = 1; d <= days; d++) 
            this.addDay(cal, d, false, y, m);
        
        // Días del mes siguiente
        for (let d = 1; d <= 42 - first - days; d++) 
            this.addDay(cal, d, true, y, m + 1);

        this.updateStats();
    }

    addDay(cal, day, other, y, m) {
        const div = document.createElement('div');
        div.className = 'aspect-square rounded-md flex items-center justify-center text-[11px] border border-gray-300 bg-white ' +
            (other ? 'text-gray-400' : 'text-gray-800');
        div.textContent = day;
        
        const str = this.dateStr(y, m, day);
        const today = this.dateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        
        if (str === today && !other) {
            div.classList.add('!border-[var(--accent-red)]', 'border-2', 'font-bold');
        }
        
        if (this.completed.has(str)) {
            div.classList.remove('bg-white');
            div.classList.add('!bg-[var(--primary)]', 'text-white', 'font-bold');
        }
        
        cal.appendChild(div);
    }

    updateStats() {
        document.getElementById('streak').textContent = this.rachaActual || 0;
        document.getElementById('total').textContent = this.totalDias || 0;
    }
}

// Función para inicializar el calendario
async function initCalendario(idNiño) {
    const calendario = new CalendarioRacha(idNiño);
    await calendario.render();
    
    document.getElementById('prev-month').onclick = async () => {
        calendario.date.setMonth(calendario.date.getMonth() - 1);
        await calendario.render();
    };
    
    document.getElementById('next-month').onclick = async () => {
        calendario.date.setMonth(calendario.date.getMonth() + 1);
        await calendario.render();
    };
}

// Exportar funciones para uso global
window.initCalendario = initCalendario;
window.CalendarioRacha = CalendarioRacha;