import { MD3LightTheme as DefaultTheme, MD3Theme } from "react-native-paper";

export const CustomTheme: MD3Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "#078be3",
        background: "#f3faff",
        surface: "#f3faff",
        surfaceVariant: "#f3faff",
        onPrimary: "#f3faff",
        onSurfaceVariant: '#3e4756',
        error: "#B00020",
    },

};
