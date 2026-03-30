import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import PlayerPasses from './PlayerPasses';

const PlayerCard = ({ player, pagos2024, pagos2025, categorias, pases }) => {
  if (!player) return null;

  // 1. Datos Personales
  const info = pagos2025 || pagos2024 || player;
  const nombreCompleto = info.apellido && info.nombre 
    ? `${info.apellido}, ${info.nombre}` 
    : (player.apellidoNombre || "Sin Nombre");

  // 2. Validación de estados (Agregamos la lógica para "CD")
  const estaAlDia = (registro) => {
    if (!registro) return false;
    const valorTexto = String(registro.completo || "").toUpperCase().trim();
    
    // Si dice "CD", está al día automáticamente
    if (valorTexto === "CD") return true; 

    const tieneCertificado = valorTexto.replace(/-/g, "").length > 0;
    const monto = parseFloat(registro.primer_sem_fichaje);
    const tieneMontos = !isNaN(monto) && monto > 0;
    
    return tieneCertificado || tieneMontos;
  };

  const alDia2024 = estaAlDia(pagos2024);
  const alDia2025 = estaAlDia(pagos2025);

  // 3. Detectar si es Miembro de Comisión Directiva (CD)
  // Chequeamos en ambos años por si el registro cambió
  const esCD = String(pagos2024?.completo || "").toUpperCase() === "CD" || 
               String(pagos2025?.completo || "").toUpperCase() === "CD";

  // Lógica de Clubes
  const clubOriginal = info.club || "Sin Club";
  const ultimoPaseValido = pases?.find(p => p.estado === 'FINALIZADO' || p.estado === 'APROBADO');
  const clubActual = ultimoPaseValido ? ultimoPaseValido.club_destino : (player.club || "Sin Club");

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{nombreCompleto.toUpperCase()}</Text>
      <Text style={styles.detail}>DNI: {player.dni || info.dni}</Text>
      <Text style={styles.detail}>Club de origen: {clubOriginal.toUpperCase()}</Text>

      <Text style={[styles.detail, {fontWeight: 'bold'}]}>
        Club Actual: <Text style={{color: '#f50909'}}>{clubActual.toUpperCase()}</Text>
      </Text>
      <Text style={styles.detail}>Carnet: {info.carnet || "N/A"}</Text>

      <View style={styles.badgeContainer}>
        <StatusBadge label="JUGADOR FEDERADO" type="success" />

        {/* --- ESTADO 2024 --- */}
        {alDia2024 ? (
          <StatusBadge label="2024 AL DÍA" type="success" />
        ) : (
          <StatusBadge label="DEUDA PENDIENTE 2024" type="danger" />
        )}

        {/* --- ESTADO 2025 --- */}
        {alDia2025 ? (
          <StatusBadge label="2025 AL DÍA" type="success" />
        ) : (
          <StatusBadge label="PENDIENTE FICHAJE 2025" type={pagos2025 ? "danger" : "default"} />
        )}

        {/* --- CARTEL ESPECIAL CD (CORREGIDO) --- */}
        {esCD && (
          <View style={styles.badgeCD}>
            <Text style={styles.textCD}>⭐ EXENTO - DIRIGENTE / CD</Text>
          </View>
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
  // Estilos para el nuevo Badge de CD
  badgeCD: { backgroundColor: '#ffd700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWeight: 1, borderColor: '#b8860b' },
  textCD: { fontWeight: 'bold', color: '#000', fontSize: 12 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#f50909', marginBottom: 8 },
  catText: { fontSize: 15, color: '#333', marginBottom: 3 }
});

export default PlayerCard;