import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import PlayerPasses from './PlayerPasses';

const PlayerCard = ({ player, pagos2024, pagos2025, categorias, pases }) => {
  if (!player) return null;

  // 1. Datos Personales (Prioridad 2025 -> 2024 -> Maestro)
  const info = pagos2025 || pagos2024 || player;
  const nombreCompleto = info.apellido && info.nombre 
    ? `${info.apellido}, ${info.nombre}` 
    : (player.apellidoNombre || "Sin Nombre");

 // 2. Función de validación ultra-segura
  const estaAlDia = (registro) => {
    // Si el registro no existe, no está al día
    if (!registro) return false;

    // FORZAMOS EL CAMPO A STRING: 
    // Si 'completo' es un número (ej: 0), String(0) lo vuelve "0" y evita el crash.
    // Si es null o undefined, usamos un texto vacío "".
    const valorTexto = String(registro.completo || "");
    
    // Ahora .replace() es seguro porque garantizamos que 'valorTexto' es un String
    const tieneCertificado = valorTexto.replace(/-/g, "").trim().length > 0;
    
    // Verificación de montos (convertimos a número para comparar)
    const monto = parseFloat(registro.primer_sem_fichaje);
    const tieneMontos = !isNaN(monto) && monto > 0;
    
    return tieneCertificado || tieneMontos;
  };

  // 3. Verificación de estados
  const alDia2024 = estaAlDia(pagos2024);
  const alDia2025 = estaAlDia(pagos2025);

 // DETERMINAR CLUB ACTUAL Y ORIGINAL:
  // 1. Club Original (de su ficha técnica o pagos, prioridad 2025)
  const clubOriginal = info.club || "Sin Club";
  // Si hay pases, el último pase APROBADO/FINALIZADO define el club actual.
  const ultimoPaseValido = pases?.find(p => p.estado === 'FINALIZADO' || p.estado === 'APROBADO');
  const clubActual = ultimoPaseValido ? ultimoPaseValido.club_destino : (player.club || "Sin Club");

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{nombreCompleto.toUpperCase()}</Text>
      <Text style={styles.detail}>DNI: {player.dni || info.dni}</Text>
      {/* 🟢 VOLVEMOS A MOSTRAR EL CLUB ORIGINAL */}
      <Text style={styles.detail}>Club de origen: {clubOriginal.toUpperCase()}</Text>

      {/* Club Actual resaltado (Mantenemos esta lógica) */}
      <Text style={[styles.detail, {fontWeight: 'bold'}]}>
        Club Actual: <Text style={{color: '#f50909'}}>{clubActual.toUpperCase()}</Text>
      </Text>
      <Text style={styles.detail}>Carnet: {info.carnet || "N/A"}</Text>

      <View style={styles.badgeContainer}>
        
        {/* --- 1. ESTADO FEDERATIVO --- */}
        <StatusBadge 
          label="JUGADOR FEDERADO" 
          type="success" 
        />

        {/* --- 2. ESTADO 2024 --- */}
        {alDia2024 ? (
          <StatusBadge label="2024 AL DÍA" type="success" />
        ) : (
          <StatusBadge label="DEUDA PENDIENTE 2024" type="danger" />
        )}

        {/* --- 3. ESTADO 2025 --- */}
        {alDia2025 ? (
          <StatusBadge label="2025 AL DÍA" type="success" />
        ) : (
          <StatusBadge label="PENDIENTE FICHAJE 2025" type={pagos2025 ? "danger" : "default"} />
        )}

      </View>

      <View style={styles.separator} />
      
      <Text style={styles.sectionTitle}>Categorías Habilitadas:</Text>
      {categorias && categorias.length > 0 ? (
        categorias.map((cat, i) => (
          <Text key={i} style={styles.catText}>• {cat}</Text>
        ))
      ) : (
        <Text style={styles.catText}>• Sin categorías asignadas</Text>
      )}
      <PlayerPasses pases={pases} />
    </View>
  );
};


const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '100%', marginTop: 20, elevation: 5, borderLeftWidth: 6, borderLeftColor: '#f50909' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  detail: { fontSize: 15, color: '#444', marginBottom: 3 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#f50909', marginBottom: 8 },
  catText: { fontSize: 15, color: '#333', marginBottom: 3 }
});

export default PlayerCard;