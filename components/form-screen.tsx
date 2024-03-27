import { View, StyleSheet } from "react-native";
import { FormEntryV2, FormEntryValues, FormFieldConfig, FormRow, createFieldEntry, } from "../lib/config";
import { MD3Theme, useTheme, Button } from "react-native-paper";
import React from "react";
import { FormEntryRow } from "./form-row";
import { useRouter } from "expo-router";
import { UseFormReturn, useFieldArray, useWatch } from "react-hook-form";
import { generateUUID } from "../lib/utils";
import { AddButton } from "./add-button";

export type Direction = 'UP' | 'DOWN';

export type FormScreenProps = {
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex?: number;
    onRowPress?: (rowNumber: number) => void;
    onFieldPress?: (rowIndex: number, fieldIndex: number) => void;
    onSubmit: () => Promise<void>;
    onChangeScreen: (pageNumber: number) => void;
    form: UseFormReturn<FormEntryV2, any>;      
}

export function FormScreen({
    screenIndex,
    isDesignMode = false,
    selectedRowIndex,
    onRowPress,
    onFieldPress,
    onSubmit,
    onChangeScreen,
    form,
}: FormScreenProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();

    // important: only use for ENTRY forms 
    // template has its own. cant have two with the same name
    // for reliable output
    const {
        fields: rowsArr,
        insert: insertRow,
    } = useFieldArray({
        control: form.control,
        name: `config.screens.${screenIndex}.rows`,
    });

    console.log(`FA ROWS: ${rowsArr.length}`)

    const screens = useWatch({
        control: form.control,
        name: 'config.screens'
    });

    const rows = useWatch({
        control: form.control,
        name: `config.screens.${screenIndex}.rows`
    });

    const screen = form.watch(`config.screens.${screenIndex}`);

    console.log(`WATCH ROWS: ${rows.length}`);
    
    const isLastScreen = screens.length === (screenIndex + 1);

    if (!screen) {
        return null;
    }

    function handleRowPress(rowIndex: number) {
        if (typeof onRowPress === 'function') {
            onRowPress(rowIndex);
        }
    }

    function handleFieldChange(field: FormFieldConfig, rowIndex: number) {
        return;
        // handleTriggersOnFieldChange({
        //     form: form.getValues(),
        //     fieldKey: field.key,
        //     screenIndex,
        //     rowKey,
        //     copyIndex,
        //     onAddRow: insertRow,
        // });
    }

    function copyRowConfig(row: FormRow) {
        return {
            ...row,
            id: generateUUID(),
            parentId: row.parentId || row.id,
            fields: row.fields.map(f => {
                return {
                    ...f,
                    id: generateUUID(),
                    entryKey: generateUUID(),
                    options: f.options?.map(o => {
                        return {
                            ...o,
                        }
                    }),
                };
            }),
        };
    }

    function createEntriesForRow(row: FormRow) {
        return row.fields.reduce<FormEntryValues>((vals, field) => {
            return {
                ...vals,
                [field.entryKey]: createFieldEntry(field.defaultValue),
            }
        }, {})
    }

    function handleCopyRow(rowIndex: number) {
        if (isDesignMode) {
            return;
        }

        const row = screen.rows[rowIndex];
        const newRow = copyRowConfig(row);
        const entries = createEntriesForRow(newRow);

        for (const entryKey in entries) {
            form.setValue(`values.${entryKey}`, entries[entryKey]);
        }

        insertRow(rowIndex + 1, newRow);
    }

    async function handleNextPress() {
        if (isLastScreen) {
            try {
                await onSubmit();
                router.replace('/');
            }
            catch (e) {
                console.error(e);
            }
        }
        else {
            onChangeScreen(screenIndex + 1);
        }
    }
    
    return (
        <View style={{ flexGrow: 1, }}>            
            <View style={styles.container}>            
                <View style={{ marginBottom: 84, flexGrow: 1, }}>
                {
                    rows.map((row, rowIndex) => {
                        const isFocused = rowIndex === selectedRowIndex;
                        const nextRow = screen.rows[rowIndex + 1];
                        const prevRowSameIdOrParentId = nextRow?.parentId === row.id 
                            || nextRow?.parentId === row.parentId;
                        const prevRowCopyRow = nextRow?.hasCopyNewBtn;
                        const showCopyBtn = row.hasCopyNewBtn 
                            && !(prevRowSameIdOrParentId && prevRowCopyRow);
                        
                        return (
                            <FormEntryRow
                                key={`screen${screenIndex}-row${rowIndex}`}
                                form={form}
                                isFocused={isFocused}
                                onPress={() => handleRowPress(rowIndex)}
                                index={rowIndex}
                                isDesignMode={isDesignMode}
                                onFieldPress={onFieldPress}
                                onFieldChange={(field, _) => handleFieldChange(field, rowIndex)}
                                control={form.control}
                                onCopyRow={(rowIndex) => handleCopyRow(rowIndex)}
                                screenIndex={screenIndex}
                                CopyButton={
                                    <>
                                     {
                                        showCopyBtn && (
                                            <View style={styles.rowButtonsContainer}>
                                                <AddButton 
                                                    onPress={() => handleCopyRow(rowIndex)}
                                                    label='Add New'    
                                                />
                                            </View>
                                        )
                                    }
                                    </>
                                }
                            />
                        )
                    })
                }
                </View>    
            </View>            
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    rowButtonsContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 12
    },
    pageBtnContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        alignContent: 'flex-end',
        paddingVertical: 12,
        flexDirection: 'row',
    },
    nextBtn: {
        borderRadius: 5,
        alignSelf: 'flex-end',
        marginLeft: 'auto',
    },
    backBtn: {
        borderRadius: 5,
    },
    nextBtnLabel: {
        textTransform: 'uppercase',
        fontWeight: '900',
    },
    container: {
        flexGrow: 1,
        maxWidth: 1200,
        paddingHorizontal: 24,
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