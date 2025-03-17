import { View, StyleSheet, Text, Modal } from 'react-native';
import { FlatList, Pressable } from 'react-native-gesture-handler';
import { useCallback, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

interface DropDownModalProps {
    options: (number | string)[];
    getSelectedOption: () => string | number | undefined;
    setSelectedOption: (option: string | number | undefined) => void;
    resetState?: Array<(value: string | undefined) => void>;
    key?: string;
    isOptionalFilter?: boolean;
}

export default function DropDownModal({ options, getSelectedOption, setSelectedOption, resetState, key, isOptionalFilter = false }: DropDownModalProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelectOption = useCallback((option: number | string) => {
        setSelectedOption(option);
        setModalVisible(false);
        if (resetState && resetState?.length > 0) {
            resetState.forEach(reset => reset(undefined));
        }
    }, []);

    return (
        <View style={styles.containerModal} key={key}>

            {/* BOTÃO PARA ABRIR MODAL */}
            <View style={isOptionalFilter ? [styles.selectButton, styles.selectButtonOptional] : styles.selectButton}>
                <Pressable onPress={() => setModalVisible(true)} style={[styles.selectedText, { flex: 0.8, alignItems: "flex-start" }]}>
                    <Text style={styles.selectedTextFont}>
                        {getSelectedOption() ? getSelectedOption() : <FontAwesome name="ellipsis-h" size={24} color="#f3faff" />}
                    </Text>
                </Pressable>
                {isOptionalFilter &&
                    !getSelectedOption() &&
                    <Pressable onPress={() => setModalVisible(true)} style={[styles.selectedText, { flex: 0.2, alignItems: "flex-end" }]}>
                        <FontAwesome name="filter" size={24} color="#f3faff" />
                    </Pressable>
                }
                {isOptionalFilter &&
                    getSelectedOption() &&
                    <Pressable onPress={() => setSelectedOption(undefined)} style={[styles.selectedText, { flex: 0.2, alignItems: "flex-end" }]}>
                        <FontAwesome name="times" size={24} color="#f3faff" />
                    </Pressable>
                }
            </View>


            {/* MODAL COM LISTA DE OPÇÕES */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => {
                                const isSelected = item === getSelectedOption();
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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3faff",
    },
    selectButton: {
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: "#078be3",
        borderRadius: 8,
        alignItems: "center",
        width: 300,
        marginBottom: 16,
    },
    selectButtonOptional: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        alignItems: "center",
    },
    selectedText: {
        fontSize: 16,
        color: "#f3faff",
        fontWeight: 'bold',
        paddingTop: 15, paddingBottom: 15
    },
    selectedTextFont: {
        fontSize: 16,
        color: "#f3faff",
        fontWeight: 'bold',
        fontFamily: 'sans-serif, Roboto',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "80%",
        backgroundColor: "#f3faff",
        padding: 20,
        borderRadius: 10,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        alignItems: "center",
    },
    selectedOption: {
        backgroundColor: "#078be3",
    },
    optionText: {
        fontSize: 16,
        color: "#3e4756",
    },
    selectedOptionText: {
        fontWeight: "bold",
        color: "#f3faff",
    },
});
