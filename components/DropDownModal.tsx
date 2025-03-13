import { View, StyleSheet, Text, Modal } from 'react-native';
import { FlatList, Pressable } from 'react-native-gesture-handler';
import { useCallback, useState } from 'react';

interface DropDownModalProps {
    options: number[];
    selectedOption: number | string;
    setSelectedOption: (option: number) => void;
}

export default function DropDownModal({ options, selectedOption, setSelectedOption }: DropDownModalProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelectOption = useCallback((option: number) => {
        setSelectedOption(option);
        setModalVisible(false);
    }, []);

    return (
        <View style={styles.containerModal}>

            {/* BOTÃO PARA ABRIR MODAL */}
            <Pressable onPress={() => setModalVisible(true)} style={styles.selectButton}>
                <Text style={styles.selectedText}>
                    {selectedOption ? selectedOption : "..."}
                </Text>
            </Pressable>

            {/* MODAL COM LISTA DE OPÇÕES */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Escolha um ano:</Text>

                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => {
                                const isSelected = item === selectedOption;
                                return (
                                    <Pressable
                                        onPress={() => handleSelectOption(item)}
                                        style={[styles.option, isSelected && styles.selectedOption]}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                            {item}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    containerModal: {
        // flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#25292e",
    },
    selectButton: {
        padding: 15,
        backgroundColor: "#444",
        borderRadius: 8,
        width: "80%",
        alignItems: "center",
    },
    selectedText: {
        fontSize: 16,
        color: "#fff",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        alignItems: "center",
    },
    selectedOption: {
        backgroundColor: "#ffa726",
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    selectedOptionText: {
        fontWeight: "bold",
        color: "#000",
    },
});
