import { useState } from 'react';
import DropDownModal from '@/components/DropDownModal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import { DatePickerInput } from 'react-native-paper-dates';
import { createExpense } from '@/api/requests';


export default function SignIn() {
  const [category, setCategorty] = useState<number | string>();
  const [billValue, setBillValue] = useState<string>();
  const [date, setDate] = useState<Date>();
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const categories = ['Luz', 'Condomínio', 'Fundo de Reserva', 'Agua Área Comum', 'Água', 'Gás', 'Outros'];

  const formatCurrency = (text: string) => {

    let cleanValue = text.replace(/\D/g, "");

    let numericValue = parseFloat(cleanValue) / 100;

    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleChangeText = (text: string) => {
    let formatted = formatCurrency(text);
    setBillValue(formatted);
  };

  const registerNewBill = async () => {
    if (!category || !billValue || !date) {
      setMessage("Por favor, preencha todos os campos!");
      setVisible(true);
      return;
    }

    try {
      await createExpense({
        description: String(category),
        amount: Number(billValue.replace("R$", "").replace(",", ".")),
        date: date?.toISOString(),
      });

      setMessage("Despesa registrada com sucesso! ✅");
    } catch (error) {
      setMessage("Erro ao registrar a despesa! ❌");
    } finally {
      setVisible(true);
    }
  };



  const getSelectedOption = () => category;

  return (
    <GestureHandlerRootView style={styles.container}>

      <DropDownModal getSelectedOption={getSelectedOption} options={categories} setSelectedOption={setCategorty} label='Categoria' />
      <View style={styles.inputContaier}>
        <TextInput
          label="Valor"
          value={billValue}
          onChangeText={handleChangeText}



        />
      </View>
      <View style={styles.inputContaier}>
        <DatePickerInput
          locale="pt-BR"
          label="Data"
          value={date}
          onChange={(d) => setDate(d)}
          inputMode="start"

        />
      </View>

      {category && billValue && date &&
        <Button mode="text" style={styles.button} onPress={() => { registerNewBill() }}>
          Adicionar
        </Button>
      }
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
      >
        {message}
      </Snackbar>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3faff',
    padding: 20,
  },
  inputContaier: {
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
    borderRadius: 8,
  }
});
