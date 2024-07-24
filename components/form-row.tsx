import { DimensionValue, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { FormEntryV2, FormFieldConfig, FormRow, } from "../lib/config"
import { MD3Theme, useTheme, Button, Icon, IconButton } from "react-native-paper";
import { FormField } from "./form-field";
import { Control, UseFormReturn, useWatch, } from "react-hook-form";
import { RowMeta } from "./form-screen";

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
    onDeleteRow?: (rowIndex: number) => void;
    CopyButton?: React.ReactNode;
    form: UseFormReturn<FormEntryV2, any>;
    canDeleteRow?: boolean;
    displayRowNumbers: boolean
    meta: RowMeta;
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
    canDeleteRow = false,
    onDeleteRow = () => {},
    displayRowNumbers,
    meta,
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
    const flexBasis: DimensionValue = `${100 / fieldsPerRow}%`;    

    return (
        <>
            <TouchableOpacity onPress={handlePress} style={styles.container}>
                <View style={styles.row}>
                    <View style={{ justifyContent: 'center', paddingRight: 4, paddingTop: 6, height: 54, width: 20, alignItems: 'flex-start',  }}>
                        <Text> { displayRowNumbers && meta.isInGroup ? meta.groupRowIndex : '' }</Text>
                    </View>     
                    <View style={{ ...styles.fieldRow, ...focusedStyle,}}>                
                        {
                            fields.map((field, fieldIndex) => (
                                <View style={{ flex: 1, flexBasis }} key={field.entryKey}>
                                    <FormField                                        
                                        config={field}
                                        onPress={() => handleFieldPress(fieldIndex)}
                                        onChange={(field, value) => onFieldChange(field, value)}
                                        isDisabled={isDesignMode}
                                        control={control}
                                        // containerStyle={{ flexBasis, }}
                                    />
                                </View>
                            ))
                        }
                    </View>
                    { !canDeleteRow && <View style={styles.deleteButtonContainer} /> }
                    {
                        !isDesignMode && canDeleteRow && (
                            <TouchableOpacity style={styles.deleteButtonContainer} onPress={() => onDeleteRow(index)}>
                                <IconButton 
                                icon='trash-can-outline' 
                                style={styles.deleteButton} 
                                iconColor={theme.colors.tertiary}
                                />
                            </TouchableOpacity>
                        )
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
    deleteButton: {
        width: 28,
        height: 28,
    },
    deleteButtonContainer: {
        width: 32,
        marginBottom: 12,
        justifyContent: 'flex-end',  
        alignItems: 'center',
        alignContent: 'center'
    },
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
        position: 'relative',
        flex: 1,
    },
    fieldRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        position: 'relative',
        flex: 1,
        // width: '100%',
        columnGap: 12,
    },
    column: {
        flexDirection: 'column',
        flexGrow: 1,
    }
});