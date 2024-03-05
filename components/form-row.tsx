import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FormFieldConfig, FormRow as FormRowConfig  } from "../lib/config"
import { MD3Theme, useTheme } from "react-native-paper";
import { FormField } from "./form-field";

export type FormRowProps = {
    rows: GroupedRowFields;
    isFocused: boolean;
    onPress: (index: number) => void;
    index: number;
    screenIndex: number;
    isDesignMode: boolean;
    onFieldPress?: (rowIndex: number, fieldIndex: number) => void;
    onFieldChange?: (config: FormFieldConfig, value: any, rowIndex: number) => void;
    loopIndex?: number;
};

export type GroupedRowFields = {
    key: string;
    fields: FormFieldConfig[][];
};

export function FormRowGroup({
    rows,
    isFocused,
    index,
    onPress,
    screenIndex,
    isDesignMode,
    onFieldPress,
    loopIndex = 0,
    onFieldChange,
}: FormRowProps) {
    if (!rows) {
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

    const firstRow = rows[0];

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container}>
            <View style={{ ...styles.row, ...focusedStyle,}}>
                {
                    rows.fields.map((fieldGroup, fieldGroupIndex) => (
                        <View style={[ styles.column ]} key={`field-group-${fieldGroupIndex}`}>
                            {
                                fieldGroup.map((field, fieldIndex) => (
                                    <FormField
                                        config={field}
                                        key={`screen${screenIndex}-row${index}-grp-${fieldGroupIndex}-field${fieldIndex}`}
                                        onPress={() => handleFieldPress(fieldGroupIndex)}
                                        onChange={(field, value) => onFieldChange(field, value, index + fieldIndex)}
                                        isDisabled={isDesignMode}
                                    />
                                ))
                            }
                        </View>
                    ))
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
    },
    column: {
        flexDirection: 'column',
        flexGrow: 1,
    }
});