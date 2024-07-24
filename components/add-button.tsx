import { StyleProp, StyleSheet, TextStyle, ViewStyle } from "react-native";
import { Button, MD3Theme, useTheme } from "react-native-paper";

export type AddButtonprops = {
    label?: string;
    onPress: () => void;
    style?: ViewStyle;
    labelStyle?: StyleProp<TextStyle>;
}

export function AddButton({
    label = 'Add',
    onPress,
    style,
    labelStyle,
}: AddButtonprops) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    return (
        <Button 
            style={[styles.btn, style]}
            onPress={onPress}
            textColor="rgb(34, 34, 34)"
            labelStyle={[styles.labelStyle, labelStyle]}
        >
            { label}
        </Button>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    btn: {
        backgroundColor: '#fff',
        borderRadius: theme.roundness,
        paddingHorizontal: 12,
        borderColor: '#DDDDDD',
        borderWidth: 1,
        maxWidth: 120,
    },
    labelStyle: {
        // letterSpacing: 0
    },
})