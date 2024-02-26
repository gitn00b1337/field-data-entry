import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FormEntryRow, FormFieldV2  } from "../lib/config"
import { MD3Theme, useTheme } from "react-native-paper";
import { FormField } from "./form-field";

export type FormRowProps = {
    row: FormEntryRow;
    isFocused: boolean;
    onPress: (index: number) => void;
    index: number;
    screenIndex: number;
    isDesignMode: boolean;
    onFieldPress?: (rowIndex: number, fieldIndex: number) => void;
    onFieldChange?: (field: FormFieldV2, value: any) => void;
    loopIndex?: number;
}

export function FormRow({
    row,
    isFocused,
    index,
    onPress,
    screenIndex,
    isDesignMode,
    onFieldPress,
    loopIndex = 0,
    onFieldChange,
}: FormRowProps) {
    if (!row) {
        return null;
    }

    const theme = useTheme();
    const styles = makeStyles(theme);
    const focusedStyle = isFocused && isDesignMode ? styles.border : {};

    function handlePress() {
        if (!isDesignMode || !onPress) {
            return;
        }

        onPress(index);
    }

    function handleFieldPress(fieldIndex: number) {
        if (!onFieldPress) {
            return;
        }

        onFieldPress(index, fieldIndex);
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
                                onPress={() => handleFieldPress(fieldIndex)}
                                onChange={onFieldChange}
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
        paddingBottom: 0,
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
        position: 'relative'
    }
});