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

    // --- Lógica de Validación de Pagos ---
    
    // Para 2024: Consideramos pagado si 'completo' no está vacío 
    // o si existen montos cargados en los semestres.
    const estaPagado2024 = data2024 && (
      data2024.completo !== "" && data2024.completo !== "-------" || 
      data2024.primer_sem_fichaje > 0
    );

    // Para 2025: (puedes ajustar esta lógica según cómo cargues 2025)
    const estaPagado2025 = data2025 && data2025.pagado === true;

    return {
      info: infoPersonal,
      pagos: {
        deuda2024: !estaPagado2024,
        deuda2025: !estaPagado2025,
      },
      detalles: { data2024, data2025 }
    };

  } catch (error) {
    console.error("Error en Firebase:", error);
    throw error;
  }
};