import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FormRow } from "../../lib/config"
import { MD3Theme, useTheme } from "react-native-paper";
import { FormField } from "../../components/form-field";

export type FormConfigRowProps = {
    row: FormRow;
    isFocused: boolean;
    onPress: (index: number) => void;
    index: number;
    screenIndex: number;
    isDesignMode: boolean;
}

export function FormConfigRow({
    row,
    isFocused,
    index,
    onPress,
    screenIndex,
    isDesignMode,
}: FormConfigRowProps) {
    if (!row) {
        return null;
    }

    const theme = useTheme();
    const styles = makeStyles(theme);
    const focusedStyle = isFocused && isDesignMode ? styles.border : {};

    function handlePress() {
        if (!isDesignMode) {
            return;
        }

        onPress(index);
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={{ ...styles.row, ...focusedStyle,}}>
                {
                    row.fields.map((field, fieldIndex) => {

                        return (
                            <FormField
                                config={field}
                                key={`screen${screenIndex}-row${index}-field${fieldIndex}`}
                            />
                        );
                    })
                }
            </View>
        </TouchableOpacity>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        minWidth: 100,
        minHeight: 50,
        paddingBottom: 12,
        paddingRight: 24,        
    },
    border: {
        borderColor: theme.colors.secondary,
        borderWidth: 2,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignContent: 'stretch',
        alignItems: 'stretch',
    }
});