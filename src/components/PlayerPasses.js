import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ... dentro de PlayerPasses ...
const PlayerPasses = ({ pases }) => {
  if (!pases || pases.length === 0) return null;

  // 1. ORDENAR: El más reciente (anio) arriba
  const pasesOrdenados = [...pases].sort((a, b) => {
    return (Number(b.anio) || 0) - (Number(a.anio) || 0);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HISTORIAL DE PASES ASH</Text>
      {pasesOrdenados.map((pase, index) => {
        // 2. LÓGICA DE PRIORIDAD PARA EL ESTADO
        let estadoMostrar = (pase.estado || "PENDIENTE").toUpperCase();
        const infoVencido = (pase.vencido || "").toUpperCase();
        
        // Si la columna N tiene texto (ej: "No figura en circular"), eso manda
        const tieneNotaEspecial = infoVencido.length > 2; 

        return (
          <View key={index} style={styles.passCard}>
            <Text style={styles.date}>📅 {pase.anio || "S/D"}</Text>
            <View style={styles.row}>
              <Text style={styles.club}>{pase.club_origen}</Text>
              <Text style={styles.arrow}> ➔ </Text>
              <Text style={[styles.club, {fontWeight: 'bold'}]}>{pase.club_destino}</Text>
            </View>
            <Text style={[
              styles.status, 
              tieneNotaEspecial ? styles.statusVenc : 
              estadoMostrar === 'FINALIZADO' ? styles.statusFin : styles.statusPend
            ]}>
              ESTADO: {tieneNotaEspecial ? infoVencido : estadoMostrar}
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
    borderLeftColor: '#f50909',
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
  statusPend: { color: '#f5a623', backgroundColor: '#fff3e0' },
  statusRech: { color: '#c62828', backgroundColor: '#ffebee' },
  statusVenc: { color: '#455a64', backgroundColor: '#eceff1' }
});

export default PlayerPasses;