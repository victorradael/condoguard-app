import { Text, View, StyleSheet } from 'react-native';

export default function BillsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#3e4756',
  },
});