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

    // 4. Determinar Info Final (Prioridad de datos)
    let infoFinal: any = null;
    
    if (snap2025.exists()) {
      infoFinal = snap2025.data();
    } else if (listaPases.length > 0) {
      // Si no hay pagos 2025, tomamos los datos del pase más reciente
      infoFinal = listaPases[0];
    } else if (snapMaster.exists()) {
      infoFinal = snapMaster.data();
    } else if (snap2024.exists()) {
      infoFinal = snap2024.data();
    }

    if (!infoFinal) return null;

    // 5. Procesar Categorías (DIV en el Excel de pases)
    let cats: string[] = [];
    const rawCats = infoFinal["categorias"] || infoFinal["DIV"] || infoFinal["division"];
    
    if (Array.isArray(rawCats)) {
      cats = rawCats;
    } else if (rawCats) {
      // Forzamos a string para evitar errores si DIV es un número (ej: "1")
      cats = [String(rawCats)];
    }

    return {
      info: infoFinal,
      pagos2024: snap2024.exists() ? snap2024.data() : null,
      pagos2025: snap2025.exists() ? snap2025.data() : null,
      pases: listaPases,
      categorias: cats
    };

  } catch (error) {
    console.error("Error en búsqueda:", error);
    throw error;
  }
};