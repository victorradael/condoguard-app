import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#078be3',
        headerStyle: {
          backgroundColor: '#f3faff',
        },
        headerShadowVisible: false,
        headerTintColor: '#3e4756',
        tabBarStyle: {
          backgroundColor: '#f3faff',
        },

      }}>
      <Tabs.Screen name="bills" options={{
        title: '',
        tabBarIcon: ({ color, focused }) => (
          <FontAwesome name={focused ? 'file' : 'file-o'} size={24} color={color} />
        )
      }} />
      <Tabs.Screen name="index" options={{
        title: '',
        tabBarIcon: ({ color, focused }) => (
          <FontAwesome name={focused ? 'area-chart' : 'area-chart'} size={24} color={color} />
        )
      }} />
      <Tabs.Screen name="user" options={{
        title: '',
        tabBarIcon: ({ color, focused }) => (
          <FontAwesome name={focused ? 'user-circle' : 'user-circle-o'} size={24} color={color} />
        )
      }} />
    </Tabs>
  );
}
