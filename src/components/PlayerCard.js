import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge';
import PlayerPasses from './PlayerPasses';

const PlayerCard = ({ player, fichajes, deudas, pases, categorias }) => {
  // 1. Seguridad: Si no hay datos del jugador, no renderizamos nada
  if (!player) return null;

  // 2. Extracción de datos del Padrón (Master)
  const clubDeOrigenOficial = player.club || player.Club || "Sin Club";
  const nroCarnet = player.carnet || player.Carnet || "---";
  const dniJugador = player.dni || player.id || "---";

  // 3. Lógica de Nombre Completo
  // Prioriza el formato "Apellido, Nombre" del padrón
  const nombreMostrar = player.apellido && player.nombre 
    ? `${player.apellido}, ${player.nombre}` 
    : (player.apellidoNombre || player.jugador || "Sin Nombre");

  // 4. Lógica de Jugador Libre vs Federado
  // Es libre si no existe registro en las colecciones de pagos/fichaje de 2024 y 2025
  const esJugadorLibre = !fichajes?.fichado2024 && !fichajes?.fichado2025;

  // 5. Lógica de Club Actual (Basada en Pases)
  // Buscamos el último pase que esté FINALIZADO o APROBADO
  const ultimoPaseValido = pases
    ?.filter(p => p.estado === 'FINALIZADO' || p.estado === 'APROBADO')
    .sort((a, b) => (Number(b.anio || 0) - Number(a.anio || 0)))[0];
  
  const clubActual = ultimoPaseValido ? ultimoPaseValido.club_destino : clubDeOrigenOficial;

  return (
    <View style={styles.card}>
      {/* CABECERA: Nombre y DNI */}
      <Text style={styles.name}>{nombreMostrar.toUpperCase()}</Text>
      <View style={styles.rowJustified}>
        <Text style={styles.detail}>DNI: {dniJugador}</Text>
        <Text style={styles.detail}>CARNET: {nroCarnet}</Text>
      </View>

      <View style={styles.separator} />

      {/* INFORMACIÓN DE CLUBES */}
      <Text style={styles.detail}>Club de origen: <Text style={styles.valueText}>{clubDeOrigenOficial.toUpperCase()}</Text></Text>
      <Text style={styles.detail}>
        Club Actual: <Text style={[styles.valueText, {color: '#f50909'}]}>{clubActual.toUpperCase()}</Text>
      </Text>

      {/* BADGES DE ESTADO FEDERATIVO */}
      <View style={styles.badgeContainer}>
        <StatusBadge 
          label={esJugadorLibre ? "JUGADOR LIBRE (ASH)" : "JUGADOR FEDERADO"} 
          type={esJugadorLibre ? "default" : "success"} 
        />
        {fichajes?.fichado2024 && <StatusBadge label="FICHAJE 2024" type="success" />}
        {fichajes?.fichado2025 && <StatusBadge label="FICHAJE 2025" type="success" />}
      </View>

      {/* SECCIÓN DE DEUDAS (Solo si existen montos mayores a 0) */}
      {(deudas?.monto2024 > 0 || deudas?.monto2025 > 0) && (
        <View style={styles.deudaBox}>
          <Text style={styles.deudaTitle}>⚠️ ESTADO DE CUENTA (DEUDA)</Text>
          {deudas.monto2024 > 0 && (
            <Text style={styles.deudaText}>• Año 2024: ${deudas.monto2024.toLocaleString('es-AR')}</Text>
          )}
          {deudas.monto2025 > 0 && (
            <Text style={styles.deudaText}>• Año 2025: ${deudas.monto2025.toLocaleString('es-AR')}</Text>
          )}
        </View>
      )}

      <View style={styles.separator} />

      {/* CATEGORÍAS HABILITADAS */}
      <Text style={styles.sectionTitle}>Categorías Habilitadas:</Text>
      <View style={styles.catContainer}>
        {categorias?.length > 0 ? (
          categorias.map((cat, i) => (
            <Text key={i} style={styles.catText}>• {cat}</Text>
          ))
        ) : (
          <Text style={styles.catText}>• No se determinaron categorías</Text>
        )}
      </View>

      {/* HISTORIAL DE PASES */}
      <PlayerPasses pases={pases} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 12, 
    width: '100%', 
    marginTop: 20, 
    elevation: 5, 
    borderLeftWidth: 6, 
    borderLeftColor: '#f50909',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', 
   
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  rowJustified: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  detail: { fontSize: 15, color: '#444', marginBottom: 4 },
  valueText: { fontWeight: '600', color: '#1a1a1a' },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#f50909', marginBottom: 10 },
  catContainer: { marginBottom: 15 },
  catText: { fontSize: 14, color: '#333', marginBottom: 4, marginLeft: 5 },
  deudaBox: { 
    backgroundColor: '#fff1f1', 
    padding: 12, 
    borderRadius: 8, 
    marginTop: 15, 
    borderWidth: 1, 
    borderColor: '#ffcccc' 
  },
  deudaTitle: { fontWeight: 'bold', color: '#cc0000', marginBottom: 6, fontSize: 13 },
  deudaText: { color: '#444', fontSize: 14, fontWeight: '500' }
});

export default PlayerCard;