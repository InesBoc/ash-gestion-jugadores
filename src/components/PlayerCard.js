import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import PlayerPasses from './PlayerPasses';

const PlayerCard = ({ player, pagos2024, pagos2025, categorias, pases }) => {
  if (!player) return null;

  // --- SOLUCIÓN CLUB DE ORIGEN ---

  const clubDelPadron = player.club || player.Club || "Sin Club";

  // 1. Datos Personales (Solo para Nombre y Apellido)
  const infoNombre = pagos2025 || pagos2024 || player;
  const nombreCompleto = infoNombre.apellido && infoNombre.nombre 
    ? `${infoNombre.apellido}, ${infoNombre.nombre}` 
    : (player.apellidoNombre || player.jugador || "Sin Nombre");

  // 2. Lógica para Jugadores Libres y CD
  const esJugadorLibre = !pagos2024 && !pagos2025;

  const validarEstado = (registro) => {
    if (!registro) return { alDia: false, esCD: false };
    const completoStr = String(registro.completo || "").toUpperCase();
    const fichajeStr = String(registro.primer_sem_fichaje || "").toUpperCase();
    
    const esMiembroCD = completoStr.includes("CD") || fichajeStr.includes("CD");
    if (esMiembroCD) return { alDia: true, esCD: true };

    const tieneCertificado = completoStr.replace(/-/g, "").trim().length > 0;
    const monto = parseFloat(registro.primer_sem_fichaje);
    return { alDia: tieneCertificado || (!isNaN(monto) && monto > 0), esCD: false };
  };

  const estado24 = validarEstado(pagos2024);
  const estado25 = validarEstado(pagos2025);
  const esCDGlobal = estado24.esCD || estado25.esCD;

  // 3. Lógica de Club Actual (Pases)
  const ultimoPaseValido = pases?.find(p => p.estado === 'FINALIZADO' || p.estado === 'APROBADO');
  const clubActual = ultimoPaseValido ? ultimoPaseValido.club_destino : clubDelPadron;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{nombreCompleto.toUpperCase()}</Text>
      <Text style={styles.detail}>DNI: {player.dni || player.id}</Text>
      
      {/* USAMOS LA VARIABLE BLINDADA AQUÍ */}
      <Text style={styles.detail}>Club de origen: {clubDelPadron.toUpperCase()}</Text>
      
      <Text style={[styles.detail, {fontWeight: 'bold'}]}>
        Club Actual: <Text style={{color: '#f50909'}}>{clubActual.toUpperCase()}</Text>
      </Text>
      
      <View style={styles.badgeContainer}>
        <StatusBadge 
          label={esJugadorLibre ? "JUGADOR LIBRE (ASH)" : "JUGADOR FEDERADO"} 
          type={esJugadorLibre ? "default" : "success"} 
        />
        {esCDGlobal && (
          <View style={styles.badgeCD}>
            <Text style={styles.textCD}>⭐ MIEMBRO CD - EXENTO</Text>
          </View>
        )}
        <StatusBadge 
          label={estado24.alDia ? "2024 AL DÍA" : (esJugadorLibre ? "SIN REGISTRO" : "DEUDA 2024")} 
          type={estado24.alDia ? "success" : (esJugadorLibre ? "default" : "danger")} 
        />
        <StatusBadge 
          label={estado25.alDia ? "2025 AL DÍA" : (esJugadorLibre ? "SIN REGISTRO" : "DEUDA 2025")} 
          type={estado25.alDia ? "success" : (esJugadorLibre ? "default" : "danger")} 
        />
      </View>

      <View style={styles.separator} />
      <Text style={styles.sectionTitle}>Categorías Habilitadas:</Text>
      {categorias?.length > 0 ? (
        categorias.map((cat, i) => <Text key={i} style={styles.catText}>• {cat}</Text>)
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
  badgeCD: { backgroundColor: '#ffd700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  textCD: { fontWeight: 'bold', color: '#000', fontSize: 11 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#f50909', marginBottom: 8 },
  catText: { fontSize: 14, color: '#333', marginBottom: 3 }
});

export default PlayerCard;