import { db } from './firebaseConfig'; 
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  DocumentSnapshot, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';

export const buscarJugadorCompleto = async (dniUsuario: string | number) => {
  try {
    // 1. Limpiamos el DNI de cualquier cosa que no sea número
    const dniLimpio = String(dniUsuario).trim().replace(/\D/g, "");
    if (!dniLimpio) return null;

    // 2. Creamos la versión con puntos (ej: 56.739.796) para la carpeta 'players'
    const dniConPuntos = dniLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // 3. Buscamos en todas las colecciones al mismo tiempo
    const [snapMasterLimpio, snapMasterPuntos, snap2024, snap2025, snapDeudas, snapPases] = await Promise.all([
      getDoc(doc(db, 'players', dniLimpio)),      // Intento sin puntos
      getDoc(doc(db, 'players', dniConPuntos)),   // Intento con puntos (como están tus IDs)
      getDoc(doc(db, 'pagos_2024', dniLimpio)),
      getDoc(doc(db, 'pagos_2025', dniLimpio)),
      getDoc(doc(db, 'deudas', dniLimpio)),       // En deudas los tenés sin puntos
      getDocs(query(collection(db, 'pases'), where("dni", "==", dniLimpio)))
    ]);

    // 4. Verificamos cuál de los dos intentos en 'players' funcionó
    const snapMaster = snapMasterPuntos.exists() ? snapMasterPuntos : (snapMasterLimpio.exists() ? snapMasterLimpio : null);
    
    if (!snapMaster) {
      console.log("⚠️ No se encontró el documento en 'players' ni con puntos ni sin puntos.");
      return null;
    }

    return procesarResultado(snapMaster, snap2024, snap2025, snapDeudas, snapPases);

  } catch (error) {
    console.error("🔥 Error en playerService:", error);
    throw error;
  }
};

/**
 * Procesa los datos de Firebase para devolver el objeto que espera el componente.
 */
const procesarResultado = (
  snapMaster: DocumentSnapshot, 
  snap2024: DocumentSnapshot, 
  snap2025: DocumentSnapshot, 
  snapDeudas: DocumentSnapshot, 
  snapPases: QuerySnapshot
) => {
    const padronData = snapMaster.data();
    const deudasData = snapDeudas.exists() ? snapDeudas.data() : null;
    
    return {
      info: padronData,
      padron: padronData,
      fichajes: { 
        fichado2024: snap2024.exists(), 
        fichado2025: snap2025.exists() 
      },
      deudas: {
        monto2024: Number(deudasData?.deuda_2024) || 0,
        monto2025: Number(deudasData?.deuda_2025) || 0,
      },
      pases: snapPases.docs.map(d => ({ id: d.id, ...d.data() })),
      pagos2024: snap2024.exists() ? snap2024.data() : null,
      pagos2025: snap2025.exists() ? snap2025.data() : null,
    };
};