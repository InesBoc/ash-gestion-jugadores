import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlayerPasses = ({ pases }) => {
  if (!pases || pases.length === 0) return null;

  // Función para convertir números de Excel (como 44235) a fecha legible
  const formatearFechaExcel = (fechaRaw) => {
    if (!fechaRaw) return "S/D";
    
    // Si es un número (formato Excel)
    if (!isNaN(fechaRaw) && typeof fechaRaw !== 'object') {
      const fecha = new Date((fechaRaw - 25569) * 86400 * 1000);
      return fecha.toLocaleDateString('es-AR');
    }
    
    // Si ya es un string o fecha
    return String(fechaRaw);
  };
  
  // 2. Función de validación protegida contra errores de tipo
  const estaAlDia = (registro) => {
    if (!registro) return false;

    // Forzamos que 'completo' sea siempre un String para que .replace() no falle
    const valorCompleto = registro.completo ? String(registro.completo) : "";
    
    // Ahora .replace() es seguro porque valorCompleto es texto
    const tieneCertificado = valorCompleto.replace(/-/g, "").length > 0;
    
    // Validación de montos con seguridad adicional
    const tieneMontos = registro.primer_sem_fichaje && parseFloat(registro.primer_sem_fichaje) > 0;
    
    return tieneCertificado || tieneMontos;
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>HISTORIAL DE PASES</Text>
      {pases.map((pase, index) => (
        <View key={index} style={styles.passCard}>
          <Text style={styles.date}>
            {formatearFechaExcel(pase.FECHA || pase["FECHA PASE"] || pase.fecha)}
          </Text>
          
          <View style={styles.row}>
            <Text style={styles.club}>{pase.club_origen || pase["CLUB ORIGEN"]}</Text>
            <Text style={styles.arrow}> ➔ </Text>
            <Text style={[styles.club, styles.dest]}>{pase.club_destino || pase["CLUB DESTINO"]}</Text>
          </View>

          <Text style={styles.footer}>
            Tipo: {pase.tipo_pase || pase["TIPO PASE"]} | Circular: {pase.circular || pase["CIRCULAR"]}
          </Text>
          
          {pase.estado && (
            <Text style={[
              styles.status, 
              pase.estado === 'FINALIZADO' ? styles.statusFin : styles.statusPend
            ]}>
              Estado: {pase.estado}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  title: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 10, letterSpacing: 1 },
  passCard: { 
    backgroundColor: '#f9f9f9', 
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ccc'
  },
  date: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  club: { fontSize: 15, color: '#333' },
  dest: { fontWeight: 'bold', color: '#000' },
  arrow: { color: '#f50909', fontWeight: 'bold', paddingHorizontal: 5 },
  footer: { fontSize: 12, color: '#777', marginTop: 4 },
  status: { fontSize: 11, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  statusFin: { color: 'green' },
  statusPend: { color: '#f5a623' }
});

export default PlayerPasses;