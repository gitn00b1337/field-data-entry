import { DimensionValue, StyleSheet, TouchableOpacity, View } from "react-native";
import { FormEntryV2, FormFieldConfig, FormRow, } from "../lib/config"
import { MD3Theme, useTheme, Button } from "react-native-paper";
import { FormField } from "./form-field";
import { Control, UseFormReturn, useWatch, } from "react-hook-form";

export type FormRowProps = {
    isFocused: boolean;
    onPress: (index: number) => void;
    index: number;
    screenIndex: number;
    isDesignMode: boolean;
    onFieldPress?: (rowIndex: number, fieldIndex: number) => void;
    onFieldChange?: (config: FormFieldConfig, value: any) => void;
    control: Control<FormEntryV2, any>;
    onCopyRow: (rowIndex: number) => void;
    CopyButton?: React.ReactNode;
    form: UseFormReturn<FormEntryV2, any>;
};

export function FormEntryRow({
    isFocused,
    onPress,
    index,
    isDesignMode,
    onFieldChange,
    onFieldPress,
    control,
    onCopyRow,
    CopyButton,
    screenIndex,
    form,
}: FormRowProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const focusedStyle = isFocused && isDesignMode ? styles.border : {};

    const row = form.watch(`config.screens.${screenIndex}.rows.${index}`);
    const fields = form.watch(`config.screens.${screenIndex}.rows.${index}.fields`);

    if (!row?.fields) {
        console.log('NO FIELDS')
        return null;
    }

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

    const maxFields = isNaN(Number(row.maxFields)) ? 4 : Number(row.maxFields) || 4;
    const fieldCount = fields.length;
    const rows = Math.ceil(fieldCount / maxFields);
    const fieldsPerRow = Math.ceil(fieldCount / rows);

    console.log(`fieldsPerRow: ${fieldsPerRow}`)

    const width: DimensionValue = `${100 / fieldsPerRow}%`

    return (
        <>
            <TouchableOpacity onPress={handlePress} style={styles.container}>
                <View style={{ ...styles.row, ...focusedStyle,}}>                
                    {
                        fields.map((field, fieldIndex) => (
                            <FormField
                                key={field.entryKey}
                                config={field}
                                onPress={() => handleFieldPress(fieldIndex)}
                                onChange={(field, value) => onFieldChange(field, value)}
                                isDisabled={isDesignMode}
                                control={control}
                                containerStyle={{ width, }}
                            />
                        ))
                    }
                </View>
            </TouchableOpacity>
            {
                CopyButton
            }
        </>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        minWidth: 100,
        minHeight: 50,
        paddingBottom: 0,   
    },
    border: {
        borderColor: theme.colors.secondary,
        borderWidth: 2,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignContent: 'stretch',
        alignItems: 'stretch',
        position: 'relative',
    },
    column: {
        flexDirection: 'column',
        flexGrow: 1,
    }
});