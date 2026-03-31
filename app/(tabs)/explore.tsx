import { View, Text, StyleSheet } from 'react-native';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sección de Explorar (ASH)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 16, fontWeight: 'bold' }
});