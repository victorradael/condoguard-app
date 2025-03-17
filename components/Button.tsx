import { StyleSheet, View, Pressable, Text } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
    label: string;
    theme?: 'primary' | 'logout';
    onPress?: () => void;
}

export default function Button({ label, theme, onPress }: Props) {
    if (theme === 'primary') {
        return (
            <View
                style={[
                    styles.buttonContainer,
                    { borderWidth: 4, borderColor: '#078be3', borderRadius: 18 },
                ]}>
                <Pressable
                    style={[styles.button, { backgroundColor: '#3e4756' }]}
                    onPress={onPress}>
                    <FontAwesome name="picture-o" size={18} color="#f3faff" style={styles.buttonIcon} />
                    <Text style={[styles.buttonLabel, { color: '#f3faff' }]}>{label}</Text>
                </Pressable>
            </View>
        );
    }

    if (theme === 'logout') {
        return (
            <View
                style={[styles.buttonContainer, { width: '100%', position: 'absolute', bottom: 4 }]}>
                <Pressable
                    style={[styles.button, { backgroundColor: '#3e4756', }]}
                    onPress={onPress}>
                    <FontAwesome name="sign-out" size={18} color="#f3faff" style={styles.buttonIcon} />
                    <Text style={[styles.buttonLabel, { color: '#f3faff' }]}>{label}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={onPress}>
                <Text style={styles.buttonLabel}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: 320,
        height: 68,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
    },
    button: {
        borderRadius: 10,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        paddingRight: 8,
    },
    buttonLabel: {
        color: '#3e4756',
        fontSize: 16,
    },
});