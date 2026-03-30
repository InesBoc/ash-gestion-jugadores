import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import PlayerPasses from './PlayerPasses';

const PlayerCard = ({ player, pagos2024, pagos2025, categorias, pases }) => {
  if (!player) return null;

  // 1. Datos Personales (Priorizamos info de pagos, si no, usamos Padrón)
  const info = pagos2025 || pagos2024 || player;
  const nombreCompleto = info.apellido && info.nombre 
    ? `${info.apellido}, ${info.nombre}` 
    : (player.apellidoNombre || player.jugador || "Sin Nombre");

  // 2. Lógica para detectar Jugador Libre (Padrón ASH)
  // Es libre si NO tiene registros en las colecciones de pagos de 2024 ni 2025
  const esJugadorLibre = !pagos2024 && !pagos2025;

  // 3. Lógica para detectar CD (Exento)
  const esCD = String(pagos2024?.completo || "").toUpperCase() === "CD" || 
               String(pagos2025?.completo || "").toUpperCase() === "CD";

  // 4. Función de validación de estado de pago
  const obtenerEstadoPago = (registro, anio) => {
    if (esCD) return "AL DÍA (EXENTO)"; // Si es CD, ignoramos cualquier otra lógica de deuda
    if (!registro) return esJugadorLibre ? "LIBRE (SIN ACTIVIDAD)" : `DEUDA ${anio}`;
    
    const valorTexto = String(registro.completo || "").toUpperCase().trim();
    const tieneCertificado = valorTexto.replace(/-/g, "").length > 0;
    const monto = parseFloat(registro.primer_sem_fichaje);
    const tieneMontos = !isNaN(monto) && monto > 0;

    return (tieneCertificado || tieneMontos) ? "AL DÍA" : `DEUDA ${anio}`;
  };

  const estado2024 = obtenerEstadoPago(pagos2024, "2024");
  const estado2025 = obtenerEstadoPago(pagos2025, "2025");

  // Lógica de Clubes
  const clubOriginal = info.club || "Sin Club";
  const ultimoPaseValido = pases?.find(p => p.estado === 'FINALIZADO' || p.estado === 'APROBADO');
  const clubActual = ultimoPaseValido ? ultimoPaseValido.club_destino : (player.club || "Sin Club");

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{nombreCompleto.toUpperCase()}</Text>
      <Text style={styles.detail}>DNI: {player.dni || info.dni || player.id}</Text>
      <Text style={styles.detail}>Club de origen: {clubOriginal.toUpperCase()}</Text>

      <Text style={[styles.detail, {fontWeight: 'bold'}]}>
        Club Actual: <Text style={{color: '#f50909'}}>{clubActual.toUpperCase()}</Text>
      </Text>

      <View style={styles.badgeContainer}>
        {/* Badge de Jugador Libre o Federado */}
        {esJugadorLibre ? (
          <StatusBadge label="JUGADOR LIBRE (ASH)" type="default" />
        ) : (
          <StatusBadge label="JUGADOR FEDERADO" type="success" />
        )}

        {/* Badge Especial CD (Solo si aplica) */}
        {esCD && (
          <View style={styles.badgeCD}>
            <Text style={styles.textCD}>⭐ MIEMBRO CD - EXENTO</Text>
          </View>
        )}

        {/* Estado 2024 - Si es CD o está al día sale verde, sino rojo */}
        <StatusBadge 
          label={estado2024} 
          type={estado2024.includes("AL DÍA") ? "success" : "danger"} 
        />

        {/* Estado 2025 */}
        <StatusBadge 
          label={estado2025} 
          type={estado2025.includes("AL DÍA") ? "success" : (esJugadorLibre ? "default" : "danger")} 
        />
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
  badgeCD: { backgroundColor: '#ffd700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  textCD: { fontWeight: 'bold', color: '#000', fontSize: 11 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#f50909', marginBottom: 8 },
  catText: { fontSize: 14, color: '#333', marginBottom: 3 }
});

export default PlayerCard;