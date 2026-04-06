export const buscarJugadorCompleto = async (dniUsuario) => {
  console.warn("Iniciando búsqueda para DNI:", dniUsuario); // Esto DEBE aparecer en consola
  try {
    const dniLimpio = String(dniUsuario).replace(/\D/g, ""); 
    if (!dniLimpio) {
      alert("Por favor ingresá un DNI válido");
      return null;
    }

    // Usamos un timeout para que no se quede colgado si no hay internet
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout: Firebase no responde")), 5000)
    );

    const fetchData = Promise.all([
      getDoc(doc(db, 'players', dniLimpio)),
      getDoc(doc(db, 'pagos_2024', dniLimpio)),
      getDoc(doc(db, 'pagos_2025', dniLimpio)),
      getDoc(doc(db, 'deudas', dniLimpio))
    ]);

    const [snapMaster, snap2024, snap2025, snapDeudas] = await Promise.race([fetchData, timeout]);

    const dataMaster = snapMaster.exists() ? snapMaster.data() : null;
    if (!dataMaster) {
      alert("Jugador no encontrado en el padrón");
      return null;
    }

    // ... (aquí seguís con tu lógica de CD y montos)
    alert("¡Jugador encontrado!"); 
    
    return {
      info: dataMaster,
      // ... resto de tu objeto
    };

  } catch (error) {
    console.error("ERROR DETECTADO:", error);
    alert("Error crítico: " + error.message);
    return null;
  }
};