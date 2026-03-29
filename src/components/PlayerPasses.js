import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlayerPasses = ({ pases }) => {
  if (!pases || pases.length === 0) return null;

  const formatearFechaExcel = (fechaRaw) => {
    if (!fechaRaw) return "S/D";
    
    // Si es un número de Excel (ej: 44235 como el de Daniela Aguilar)
    if (!isNaN(fechaRaw) && typeof fechaRaw !== 'object') {
      const fecha = new Date((fechaRaw - 25569) * 86400 * 1000);
      return fecha.toLocaleDateString('es-AR');
    }
    
    return String(fechaRaw);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HISTORIAL DE PASES ASH</Text>
      {pases.map((pase, index) => {
        // Mapeo flexible para las columnas del Excel
        const clubOrig = pase.club_origen || pase["CLUB ORIGEN"] || "S/D";
        const clubDest = pase.club_destino || pase["CLUB DESTINO"] || "S/D";
        const estadoPase = pase.estado || pase.ESTADO || "PENDIENTE";

        return (
          <View key={index} style={styles.passCard}>
            <Text style={styles.date}>
              📅 {formatearFechaExcel(pase.FECHA || pase["FECHA PASE"] || pase.fecha)}
            </Text>
            
            <View style={styles.row}>
              <Text style={styles.club}>{clubOrig}</Text>
              <Text style={styles.arrow}> ➔ </Text>
              <Text style={[styles.club, styles.dest]}>{clubDest}</Text>
            </View>

            <Text style={styles.footer}>
              Tipo: {pase.tipo_pase || pase["TIPO PASE"] || "Definitivo"} | Circular: {pase.circular || pase["CIRCULAR"] || "N/A"}
            </Text>
            
            <Text style={[
              styles.status, 
              estadoPase.toUpperCase() === 'FINALIZADO' || estadoPase.toUpperCase() === 'APROBADO' 
                ? styles.statusFin 
                : styles.statusPend
            ]}>
              Estado: {estadoPase}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 15 },
  title: { fontSize: 13, fontWeight: 'bold', color: '#888', marginBottom: 10, textAlign: 'center' },
  passCard: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#f50909', // Rojo ASH
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  date: { fontSize: 12, fontWeight: 'bold', color: '#555' },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  club: { fontSize: 14, color: '#333' },
  dest: { fontWeight: 'bold', color: '#000' },
  arrow: { color: '#f50909', fontWeight: 'bold', paddingHorizontal: 5 },
  footer: { fontSize: 11, color: '#999' },
  status: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    marginTop: 8, 
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusFin: { color: '#2e7d32', backgroundColor: '#e8f5e9' },
  statusPend: { color: '#f5a623', backgroundColor: '#fff3e0' }
});

export default PlayerPasses;