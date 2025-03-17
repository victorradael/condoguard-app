import { SessionProvider } from '@/api/ctx';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (

      <SessionProvider>
        <Slot/>
      </SessionProvider>
  );
}
