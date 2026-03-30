export const buscarJugadorCompleto = async (dniUsuario) => {
  try {
    const dniLimpio = String(dniUsuario).replace(/\D/g, ""); 
    if (!dniLimpio) return null;

    const [snapMaster, snap2024, snap2025] = await Promise.all([
      getDoc(doc(db, 'players', dniLimpio)),
      getDoc(doc(db, 'pagos_2024', dniLimpio)),
      getDoc(doc(db, 'pagos_2025', dniLimpio))
    ]);

    const data2024 = snap2024.exists() ? snap2024.data() : null;
    const data2025 = snap2025.exists() ? snap2025.data() : null;
    const dataMaster = snapMaster.exists() ? snapMaster.data() : null;

    if (!data2024 && !data2025 && !dataMaster) return null;

    // Unificamos la info personal
    const infoPersonal = dataMaster || data2024 || data2025;

    // --- Lógica de Validación de Pagos (CORREGIDA) ---

// Para 2024: Consideramos pagado si:
// - 'completo' tiene texto (y no es solo guiones)
// - O si 'completo' dice "CD" (Caso especial ASH)
// - O si el monto del primer semestre es mayor a 0
const valorCompleto2024 = String(data2024?.completo || "").toUpperCase().trim();

const estaPagado2024 = data2024 && (
  (valorCompleto2024 !== "" && valorCompleto2024 !== "-------") || 
  valorCompleto2024 === "CD" || // <--- FIX para CD
  data2024.primer_sem_fichaje > 0
);

// Para 2025:
const estaPagado2025 = data2025 && (
    data2025.pagado === true || 
    String(data2025.completo).toUpperCase() === "CD"
);

// Determinamos si es un "Jugador Libre" (Padrón pero sin pagos recientes)
const esLibre = dataMaster && !data2024 && !data2025;

return {
  info: infoPersonal,
  pagos: {
    deuda2024: !estaPagado2024,
    deuda2025: !estaPagado2025,
    esCD: valorCompleto2024 === "CD", // Esto sirve para el cartelito
  },
  // ESTA ES LA PARTE QUE TE DABA ERROR:
  detalles: { 
    data2024: data2024 || {}, // Si es null, mandamos objeto vacío para que no explote
    data2025: data2025 || {} 
  }
};

  } catch (error) {
    console.error("Error en Firebase:", error);
    throw error;
  }
};