import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f50909', // Color institucional de la ASH
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jugadores',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
        }}
      />
    </Tabs>
  );
}