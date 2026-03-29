import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusBadge = ({ label, type }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'success': return { backgroundColor: '#28a745' }; // Verde
      case 'danger': return { backgroundColor: '#dc3545' };  // Rojo
      default: return { backgroundColor: '#6c757d' };        // Gris
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle()]}>
      <Text style={styles.text}>{label.toUpperCase()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginRight: 6, 
    marginTop: 6 
  },
  text: { color: '#fff', fontSize: 11, fontWeight: 'bold' }
});

export default StatusBadge;