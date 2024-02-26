import { FieldArray, FieldArrayRenderProps, } from "formik";
import { View, StyleSheet } from "react-native";
import { FormEntryV2, FormEntryValues, FormFieldV2, } from "../lib/config";
import { MD3Theme, useTheme, Text, FAB } from "react-native-paper";
import React from "react";
import { FormRow } from "./form-row";
import { handleTriggersOnFieldChange } from "../lib/triggers-handler";

export type Direction = 'UP' | 'DOWN';

export type FormScreenProps = {
    form: FormEntryV2;
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex?: number;
    onRowPress?: (rowNumber: number) => void;
    onFieldPress?: (rowIndex: number, fieldIndex: number) => void;
}

export function FormScreen({
    screenIndex,
    form,
    isDesignMode = false,
    selectedRowIndex,
    onRowPress,
    onFieldPress,
}: FormScreenProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    
    const fieldName = `screens[${screenIndex}]`;
    const screen = form.screens[screenIndex];

    if (!screen) {
        return null;
    }

    function handleRowPress(rowIndex: number) {
        if (typeof onRowPress === 'function') {
            onRowPress(rowIndex);
        }
    }

    function handleFieldChange(field: FormFieldV2, rowIndex: number, rowArrayHelper: FieldArrayRenderProps) {
        // console.log(`handleFieldChange: ${field.key}`)
        // console.log(JSON.stringify(form.screens[screenIndex].rows[rowIndex]));
        console.log(`HFC: ${field.name} - ${field.entryKey}`)

        handleTriggersOnFieldChange({
            form,
            fieldKey: field.key,
            rowArrayHelper,
            screenIndex,
            rowIndex,
        })
    }

    return (
        <View style={{ flexGrow: 1, }}>
            <FieldArray name={`${fieldName}.rows`}
                render={(rowArrayHelper) => (                
                    <View style={styles.container}>            
                        <View style={{ marginBottom: 84, flexGrow: 1, }}>
                        {
                            screen.rows.map((row, rowIndex) => {
                                const isFocused = rowIndex === selectedRowIndex;
                                
                                return (
                                    <FormRow 
                                        key={`screen${screenIndex}-row${rowIndex}`}
                                        row={row}
                                        isFocused={isFocused}
                                        onPress={() => handleRowPress(rowIndex)}
                                        index={rowIndex}
                                        screenIndex={screenIndex}
                                        isDesignMode={isDesignMode}
                                        onFieldPress={onFieldPress}
                                        onFieldChange={(field) => handleFieldChange(field, rowIndex, rowArrayHelper)}
                                    />
                                )
                            })
                        }
                        </View>    
                    </View>
                )}
            /> 
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    sectionBtnContainer: {
        alignItems: 'flex-end',
    },
    formSectionBtnLabel: {
        textTransform: 'uppercase',
        fontWeight: '900',
        color: theme.colors.onBackground,
    },
    formSectionBtn: {
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
    },
    formSectionTitle: {
        color: '#F56C00',
        fontWeight: '400',
    },
    formSection: {
        backgroundColor: theme.colors.surface,
        borderRadius: 0,
        padding: 0,
        margin: 0,
        marginBottom: 12,
    },
});