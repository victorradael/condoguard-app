import { router } from 'expo-router';
import { Platform, useWindowDimensions, Image, View, TextInput, StyleSheet, Text, Pressable } from 'react-native';

import { useSession } from '../api/ctx';
import { useState } from 'react';

import logo from '@/assets/images/condoguard-logo.png';


export default function SignIn() {
  const [username, setUsername] = useState<string>("");;
  const [password, setPassword] = useState<string>("");;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { width } = useWindowDimensions(); // Obtém a largura da tela

  const isWeb = Platform.OS === 'web';

  // Define os tamanhos do logo com base na plataforma
  const LOGO_WIDTH = isWeb ? 300 : width * 0.8; // Fixa um tamanho no web para evitar problemas
  const LOGO_HEIGHT = isWeb ? 60 : (LOGO_WIDTH * 90) / 320;

  const { signIn } = useSession();

  const handleLogin = async () => {
    try {
      await signIn(username, password)
      router.replace("/");

    } catch (err: any) {
      setErrorMessage(err.response.data.error);
    }
  }



  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Image source={logo} style={[styles.logo, {
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
        }]} />
        <TextInput placeholder='Usuário' placeholderTextColor={"#3e4756"} style={styles.input} value={username} onChangeText={setUsername} />
        <TextInput placeholder='Senha' placeholderTextColor={"#3e4756"} style={styles.input} secureTextEntry={true} value={password} onChangeText={setPassword} />
        {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        {username !== "" && username.length > 4 && password != "" && password.length > 4 && <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonLabel}>Entrar</Text>
          </Pressable>
        </View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#078be3', flex: 1, justifyContent: 'center', alignItems: 'center' },

  logo: {

    padding: 16,
    marginBottom: 24
  },
  error: {
    color: "#f3faff"
  },
  inputContainer: {
    width: 320,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  input: {
    marginBottom: 24,
    padding: 10,
    borderRadius: 4,
    width: '100%',
    backgroundColor: '#f3faff'
  },

  buttonContainer: {
    width: '100%',
    height: 56,
  },
  button: {
    borderRadius: 4,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#004c9a',
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    color: '#f3faff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
