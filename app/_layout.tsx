import { SessionProvider } from '@/api/ctx';
import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { CustomTheme } from '@/theme';

export default function RootLayout() {
  return (

    <SessionProvider>
      <PaperProvider theme={CustomTheme}>
        <Slot />
      </PaperProvider>
    </SessionProvider>
  );
}
