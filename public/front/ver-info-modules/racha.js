// racha.js - Sistema de Calendario de Racha para B.E.E.S.

// Clase para manejar el calendario de racha
class CalendarioRacha {
    constructor(idNiño) {
        this.idNiño = idNiño;
        this.date = new Date();
        this.completed = this.load('days_' + idNiño) || new Set();
        this.objetivosDB = [];
    }

    load(key) {
        const data = localStorage.getItem(key);
        return key.includes('days_') ? new Set(JSON.parse(data || '[]')) : JSON.parse(data || '{}');
    }

    save() {
        localStorage.setItem('days_' + this.idNiño, JSON.stringify([...this.completed]));
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

    async render() {
        await this.cargarObjetivosDB();
        
        // Verificar si todos los objetivos están completados para marcar el día de hoy
        const today = this.dateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        if (this.objetivosDB.length > 0) {
            const todosCompletados = this.objetivosDB.every(obj => obj.completado === 1 || obj.completado === true);
            if (todosCompletados) {
                this.completed.add(today);
            } else {
                this.completed.delete(today);
            }
            this.save();
        }
        
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
        let streak = 0;
        let d = new Date();
        
        while (this.completed.has(this.dateStr(d.getFullYear(), d.getMonth(), d.getDate()))) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
        
        document.getElementById('streak').textContent = streak;
        document.getElementById('total').textContent = this.completed.size;
    }
}

// Función para inicializar el calendario
async function initCalendario(idNiño) {
    const calendario = new CalendarioRacha(idNiño);
    await calendario.render();
    
    document.getElementById('prev-month').onclick = () => {
        calendario.date.setMonth(calendario.date.getMonth() - 1);
        calendario.render();
    };
    
    document.getElementById('next-month').onclick = () => {
        calendario.date.setMonth(calendario.date.getMonth() + 1);
        calendario.render();
    };
}

// Exponer funciones globalmente para que ver-info.js pueda usarlas
window.initCalendario = initCalendario;
window.CalendarioRacha = CalendarioRacha;

