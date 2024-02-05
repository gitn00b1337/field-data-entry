import { FieldArray, FieldArrayRenderProps, Formik } from "formik";
import { View, StyleSheet } from "react-native";
import { Form } from "../lib/form";
import { FormScreenConfig, createFieldConfig, createFormRow } from "../lib/config";
import { FormField } from "./form-field";
import { MD3Theme, useTheme, Text, FAB } from "react-native-paper";
import React from "react";
import { FormConfigRow } from "../app/template/row";
import { useGlobalState } from "../app/global-state";

export type Direction = 'UP' | 'DOWN';

export type DataCollectionFormScreenProps<T> = {
    onSubmit: (values: T) => void;
    form: Form;
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex: number;
    setSelectedRowIndex: (number: number) => void;
    onRowPress: (rowNumber: number) => void;
    onAddRowPress: () => void;
    onChangeRowPress: (direction: Direction) => void;
}

export function DataCollectionFormScreen<T>({
    onSubmit,
    screenIndex,
    form,
    isDesignMode = false,
    selectedRowIndex,
    setSelectedRowIndex,
    onAddRowPress,
    onChangeRowPress,
    onRowPress,
}: DataCollectionFormScreenProps<T>) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    
    const fieldName = `screens[${screenIndex}]`;
    const screen = form.config.screens[screenIndex];

    if (!screen) {
        return null;
    }

    return (
        <View>
            <FieldArray name={`${fieldName}.rows`}
                render={(rowArrayHelper) => (                
                    <View style={styles.container}>                     
                        <View>
                            <Text>{ screen.title || `Screen ${screenIndex + 1}` }</Text>
                        </View>
                        <View style={{ marginBottom: 72, }}>
                        {
                            screen.rows.map((row, rowIndex) => {
                                const isFocused = rowIndex === selectedRowIndex;
                                
                                return (
                                    <FormConfigRow 
                                        key={`screen${screenIndex}-row${rowIndex}`}
                                        row={row}
                                        isFocused={isFocused}
                                        onPress={() => onRowPress(rowIndex)}
                                        index={rowIndex}
                                        screenIndex={screenIndex}
                                        isDesignMode={isDesignMode}
                                    />
                                )
                            })
                        }
                        </View>
                        {
                            isDesignMode && (
                                <>
                                    <FAB
                                        icon="plus"
                                        style={{ ...styles.fab, }}
                                        onPress={() => onAddRowPress()}
                                        color={theme.colors.onPrimary}
                                    />
                                    <FAB
                                        icon="arrow-up-bold"
                                        style={{ ...styles.fab, right: 70, backgroundColor: theme.colors.background, }}
                                        onPress={() => onChangeRowPress('UP')}
                                        color={theme.colors.secondary}
                                    />
                                    <FAB
                                        icon="arrow-down-bold"
                                        style={{ ...styles.fab, right: 140, backgroundColor: theme.colors.background, }}
                                        onPress={() => onChangeRowPress('DOWN')}
                                        color={theme.colors.secondary}
                                    />
                                </>
                            )
                        }                   
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
    fab: {
        position: 'absolute',
        margin: 12,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.surface,
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