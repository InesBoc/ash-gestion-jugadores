import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { buscarJugadorCompleto } from '../../src/services/playerService';
import { calcularCategoriasHabilitadas } from '../../src/utils/hockeyLogic';
import PlayerCard from '../../src/components/PlayerCard';

export default function HomeScreen() {
  const [dni, setDni] = useState('');
  const [sexo, setSexo] = useState('F');
  const [loading, setLoading] = useState(false);
  const [resultadoBusqueda, setResultadoBusqueda] = useState<any>(null);
  const [categoriasFinales, setCategoriasFinales] = useState<string[]>([]);
  
const realizarBusqueda = async () => {
  if (!dni) return Alert.alert("Error", "Ingresá un DNI");
  
  setLoading(true);
  setResultadoBusqueda(null);
  console.log("🔎 Intentando buscar DNI:", dni); // RASTREADOR 1

  try {
    const resultado: any = await buscarJugadorCompleto(dni);
    console.log("✅ Respuesta del Service:", resultado); // RASTREADOR 2
    
    if (resultado && resultado.info) {
      // Usamos info directamente para evitar errores de referencia
      const fechaNacRaw = resultado.info.fechaNacimiento || resultado.info["F. NAC"];
      const catsPorEdad = calcularCategoriasHabilitadas(fechaNacRaw, sexo);

      const divPadron = resultado.info?.DIV || resultado.info?.division || "";
      const divPagos = resultado.pagos2024?.division || ""; 

      const categoriasDeBaseDeDatos = [divPadron, divPagos].filter(c => Boolean(c));
      const combinadas = Array.from(new Set([...catsPorEdad, ...categoriasDeBaseDeDatos]));

      setResultadoBusqueda(resultado);
      setCategoriasFinales(combinadas);
      console.log("🎯 Tarjeta lista para mostrar"); // RASTREADOR 3
    } else {
      console.log("❌ Jugador no encontrado en la DB");
      Alert.alert("Atención", "El DNI no figura en el padrón de la ASH.");
    }
  } catch (error: any) {
    console.error("🔥 ERROR CRÍTICO:", error); // RASTREADOR 4
    Alert.alert("Error", "Fallo en la conexión: " + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 🛡️ ESCUDO INSTITUCIONAL */}
      <Image 
        source={require('../../assets/images/escudo_ash.jpeg')} 
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Asociación Salteña de Hockey</Text>
      <Text style={styles.subtitle}>Gestión de Jugadores 🏒</Text>

      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.sexButton, sexo === 'F' && styles.sexButtonActive]} 
          onPress={() => setSexo('F')}
        >
          <Text style={sexo === 'F' ? styles.whiteText : styles.blackText}>FEM</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sexButton, sexo === 'M' && styles.sexButtonActive]} 
          onPress={() => setSexo('M')}
        >
          <Text style={sexo === 'M' ? styles.whiteText : styles.blackText}>MASC</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="DNI (sin puntos)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={dni}
        onChangeText={setDni}
      />

      <TouchableOpacity style={styles.button} onPress={realizarBusqueda} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>BUSCAR JUGADOR</Text>
        )}
      </TouchableOpacity>

      {/* 🃏 RENDERIZADO DE LA TARJETA */}
      {resultadoBusqueda && resultadoBusqueda.info && (
        <PlayerCard 
          player={resultadoBusqueda.info}
          fichajes={resultadoBusqueda.fichajes} 
          deudas={resultadoBusqueda.deudas} 
          pases={resultadoBusqueda.pases} 
          categorias={categoriasFinales} 
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 40, padding: 20, backgroundColor: '#f5f5f5', flexGrow: 1 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f50909', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#444', marginBottom: 20, fontWeight: '500' },
  row: { flexDirection: 'row', marginBottom: 15, width: '100%', justifyContent: 'space-between' },
  sexButton: { flex: 0.48, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
  sexButtonActive: { backgroundColor: '#333', borderColor: '#333' },
  whiteText: { color: '#fff', fontWeight: 'bold' },
  blackText: { color: '#000' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#f50909', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});