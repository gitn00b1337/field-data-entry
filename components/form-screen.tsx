import { FieldArray, FieldArrayRenderProps, } from "formik";
import { View, StyleSheet } from "react-native";
import { FormEntryV2, FormEntryValues, FormFieldConfig, } from "../lib/config";
import { MD3Theme, useTheme, Button } from "react-native-paper";
import React from "react";
import { FormRowGroup, GroupedRowFields } from "./form-row";
import { handleTriggersOnFieldChange } from "../lib/triggers-handler";
import { useRouter } from "expo-router";

export type Direction = 'UP' | 'DOWN';

export type FormScreenProps = {
    form: FormEntryV2;
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex?: number;
    onRowPress?: (rowNumber: number) => void;
    onFieldPress?: (rowIndex: number, fieldIndex: number) => void;
    onSubmit: () => Promise<void>;
    onChangeScreen: (pageNumber: number) => void;
    entry: FormEntryValues;
}

export function FormScreen({
    screenIndex,
    form,
    isDesignMode = false,
    selectedRowIndex,
    onRowPress,
    onFieldPress,
    onSubmit,
    onChangeScreen,
    entry,
}: FormScreenProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const router = useRouter();
    
    const config = form.config;
    const fieldName = `config.screens[${screenIndex}]`;
    const screen = config.screens[screenIndex];
    const isLastScreen = config.screens.length === (screenIndex + 1);

    if (!screen) {
        return null;
    }

    function handleRowPress(rowIndex: number) {
        if (typeof onRowPress === 'function') {
            onRowPress(rowIndex);
        }
    }

    function handleFieldChange(field: FormFieldConfig, rowIndex: number, rowArrayHelper: FieldArrayRenderProps) {
        handleTriggersOnFieldChange({
            entry,
            config: form.config,
            fieldKey: field.key,
            rowArrayHelper,
            screenIndex,
            rowIndex,
        });
    }

    function handleNextPress() {
        if (isLastScreen) {
            onSubmit()
                .then(() => {
                    router.replace('/');
                })
        }
        else {
            onChangeScreen(screenIndex + 1);
        }
    }

    const groupedRows = screen.rows
        .filter(row => !row.copyIndex)
        .map<GroupedRowFields>(row => {
            const grpRows = screen.rows.filter(r => r.key === row.key)
                .sort((r1,  r2) => r1.copyIndex - r2.copyIndex);

            const fields = row.fields.map((field, fieldIndex) => {
                const fieldColumn = grpRows.map(row => row.fields[fieldIndex]);
                return fieldColumn;
            });

            return {
                key: row.key,
                fields,
            };
        });
    
    return (
        <View style={{ flexGrow: 1, }}>
            <FieldArray name={`${fieldName}.rows`}
                render={(rowArrayHelper) => (                
                    <View style={styles.container}>            
                        <View style={{ marginBottom: 84, flexGrow: 1, }}>
                        {
                            groupedRows.map((grp, rowIndex) => {
                                const isFocused = rowIndex === selectedRowIndex;
                                
                                return (
                                    <FormRowGroup 
                                        key={`screen${screenIndex}-row${rowIndex}`}
                                        rows={grp}
                                        isFocused={isFocused}
                                        onPress={() => handleRowPress(rowIndex)}
                                        index={rowIndex}
                                        screenIndex={screenIndex}
                                        isDesignMode={isDesignMode}
                                        onFieldPress={onFieldPress}
                                        onFieldChange={(field, _, fieldRowIndex) => handleFieldChange(field, fieldRowIndex, rowArrayHelper)}
                                    />
                                )
                            })
                        }
                        {
                            !isDesignMode && (
                                <View style={styles.pageBtnContainer}>
                                    {
                                        screenIndex > 0 && (
                                            <Button 
                                                style={styles.backBtn}
                                                mode="contained-tonal"
                                                buttonColor={theme.colors.secondary}
                                                textColor={'#fff'}
                                                labelStyle={styles.nextBtnLabel}
                                                onPress={() => onChangeScreen(screenIndex -1)}
                                            >
                                                Back
                                            </Button>
                                        )
                                    }
                                    <Button
                                        style={styles.nextBtn}
                                        mode="contained-tonal"
                                        buttonColor={theme.colors.secondary}
                                        textColor={'#fff'}
                                        labelStyle={styles.nextBtnLabel}
                                        onPress={handleNextPress}
                                    >
                                        { isLastScreen ? 'Finish' : 'Next' }
                                    </Button>
                                </View>
                            )
                        }
                        </View>    
                    </View>
                )}
            /> 
            
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
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