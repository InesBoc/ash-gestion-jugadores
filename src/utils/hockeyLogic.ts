/**
 * Normaliza fechas provenientes de Firebase (Números de Excel o Strings)
 */
export const normalizarFecha = (fecha: any): Date | null => {
    if (!fecha) return null;

    // 1. Si viene como NÚMERO (Como el 36581 de Lucía en tu Firebase)
    if (typeof fecha === 'number') {
        // Offset de Excel: 25569. Usamos Math.round para evitar errores de precisión.
        return new Date(Math.round((fecha - 25569) * 86400 * 1000));
    }

    // 2. Si viene como STRING
    if (typeof fecha === 'string') {
        const textoLimpio = fecha.trim();
        
        // Si el string es puramente numérico (ej: "36581")
        if (!isNaN(Number(textoLimpio)) && textoLimpio.length > 4) {
            return normalizarFecha(Number(textoLimpio)); 
        }
        
        // Manejo de formatos tipo "25-02-00" (Años de 2 dígitos)
        // Intentamos detectar si tiene guiones o barras
        if (textoLimpio.includes('-') || textoLimpio.includes('/')) {
            const partes = textoLimpio.split(/[-/]/);
            if (partes.length === 3) {
                let [dia, mes, anio] = partes.map(Number);
                // Si el año tiene 2 dígitos (ej: 00), lo convertimos a 2000
                if (anio >= 0 && anio <= 30) anio += 2000;
                else if (anio > 30 && anio < 100) anio += 1900;
                
                return new Date(anio, mes - 1, dia);
            }
        }

        const intentoFecha = new Date(textoLimpio);
        return isNaN(intentoFecha.getTime()) ? null : intentoFecha;
    }

    return null;
};

/**
 * Calcula las categorías de la ASH basándose en la edad al 31 de diciembre
 */
export const calcularCategoriasHabilitadas = (fechaNacimientoRaw: any, sexo: string): string[] => {
    const fecha = normalizarFecha(fechaNacimientoRaw);
    
    if (!fecha) return ['Error en fecha'];

    const anioNacimiento = fecha.getFullYear();
    const anioActual = new Date().getFullYear(); // 2026
    const edad = anioActual - anioNacimiento;
    
    const categorias: string[] = [];

    // Ajuste de sexo para que no falle por mayúsculas/minúsculas
    const s = sexo?.toUpperCase();

    if (s === 'F') {
        if (edad >= 12 && edad <= 14) categorias.push('Septima Damas');
        if (edad >= 13 && edad <= 16) categorias.push('Sexta Damas');
        if (edad >= 15 && edad <= 19) categorias.push('Quinta Damas');
        if (edad >= 16) categorias.push('Primera e Intermedia Damas');
        if (edad >= 20) categorias.push('Segunda'); 
    } else {
        if (edad >= 9 && edad <= 14) categorias.push('Sexta Caballeros');
        if (edad >= 14 && edad <= 19) categorias.push('Quinta Caballeros');
        if (edad >= 15) categorias.push('Primera e intermedia Caballeros');
    }

    return categorias.length > 0 ? categorias : ['Infantiles / Escuelita'];
};

/**
 * Determina si el jugador no tuvo actividad en los últimos 2 años
 */
export const esJugadorLibre = (aniosJugados: number[]): boolean => {
    if (!aniosJugados || aniosJugados.length === 0) return true;
    
    const anioActual = new Date().getFullYear();
    const tieneActividadReciente = aniosJugados.includes(anioActual) || aniosJugados.includes(anioActual - 1);
    
    return !tieneActividadReciente;
};