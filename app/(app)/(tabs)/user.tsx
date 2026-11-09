import { View, StyleSheet } from 'react-native';
import { useSession } from '@/api/ctx';
import { router } from 'expo-router';
import Button from '@/components/Button';

export default function UserScreen() {
  const { signOut } = useSession();
  return (
    <View style={styles.container}>


      <Button label='Sair' theme='logout' onPress={() => {
        signOut();
        router.replace('/sign-in');
      }} />
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