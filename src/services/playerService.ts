import { db } from './firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

export const buscarJugadorCompleto = async (dniUsuario: string | number) => {
  try {
    // 1. Limpieza absoluta del DNI
    const dniLimpio = String(dniUsuario).replace(/\D/g, "");
    if (!dniLimpio) return null;

    // 2. Consultas en paralelo
    const [snap2024, snap2025, snapMaster, snapPases] = await Promise.all([
      getDoc(doc(db, 'pagos_2024', dniLimpio)),
      getDoc(doc(db, 'pagos_2025', dniLimpio)),
      getDoc(doc(db, 'players', dniLimpio)),
      // Buscamos por el campo "dni" tal cual está en la colección de Firebase
      getDocs(query(collection(db, 'pases'), where("dni", "==", dniLimpio)))
    ]);

    // 3. Procesar Pases (Caso: Lourdes Mariana Aguirre Frias)
    const listaPases = snapPases.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

    // Ordenar por AÑO descendente para que el primer pase sea el más reciente
    listaPases.sort((a, b) => {
      const anioA = Number(a["AÑO"]) || Number(a["anio"]) || 0;
      const anioB = Number(b["AÑO"]) || Number(b["anio"]) || 0;
      return anioB - anioA;
    });

  // 4. Determinar Info Final (NUEVA PRIORIDAD PARA JUGADORES LIBRES)
    let infoFinal: any = null;
    let padronOriginal: any = null;

    // Guardamos SIEMPRE los datos del padrón si existen para el Club de Origen
    if (snapMaster.exists()) {
      padronOriginal = snapMaster.data();
    }
    
    // Prioridad para mostrar Nombres/Apellidos en la tarjeta
    if (snap2025.exists()) {
      infoFinal = snap2025.data();
    } else if (snap2024.exists()) {
      infoFinal = snap2024.data();
    } else if (listaPases.length > 0) {
      infoFinal = listaPases[0];
    } else if (padronOriginal) {
      infoFinal = padronOriginal; // <--- ESTO permite que aparezcan los LIBRES
    }

    // Si no está en ninguna colección, recién ahí es null
    if (!infoFinal) return null;

    return {
      info: infoFinal,
      padron: padronOriginal, // <--- MANDAMOS EL PADRÓN APARTE
      pagos2024: snap2024.exists() ? snap2024.data() : null,
      pagos2025: snap2025.exists() ? snap2025.data() : null,
      pases: listaPases
    };

  } catch (error) {
    console.error("Error en búsqueda:", error);
    throw error;
  }
};