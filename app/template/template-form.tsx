import { ScrollView, StyleSheet, View, } from "react-native";
import { FormConfig, FormFieldConfig, FormRow, createFieldConfig, createFormRow, createFormScreenConfig } from "../../lib/config";
import { useTheme, Card, MD3Theme, } from 'react-native-paper';
import {  FieldArray, FieldArrayRenderProps, FormikProps, FormikHelpers } from 'formik';
import { FormInput } from "../../components/form-input";
import { useEffect, useState } from "react";
import { DrawerMenu } from "./drawer";
import { useGlobalState } from "../global-state";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DataCollectionForm } from "../../components/data-collection-form";
import { Form, FormEntry, createForm, getEntryInitialValues } from "../../lib/form";
import { Stack, useRouter, } from "expo-router";
import { HeaderButtons } from "./header-buttons";

export type TemplateFormProps = {
    showDrawer: boolean;
} & FormikProps<FormConfig>

type FormSelections = {
    screenIndex: number;
    rowIndex: number;
    fieldIndex: number;
}

const initFormSelections: FormSelections = {
    screenIndex: 0,
    rowIndex: -1,
    fieldIndex: -1,
}

export function TemplateForm({ handleSubmit, values, }: TemplateFormProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    const [formSelections, setFormSelections] = useState(initFormSelections);
    const router = useRouter();

    const screen = values.screens ? values.screens[formSelections.screenIndex] : undefined;
    const selectedRow: FormRow | undefined = screen?.rows ? screen?.rows[formSelections.rowIndex] : undefined;
    const selectedField: FormFieldConfig | undefined = selectedRow?.fields ? selectedRow?.fields[formSelections.fieldIndex] : undefined;
    const [previewForm, setPreviewForm] = useState<{ form: Form, entry: FormEntry }>();
    const {
        screenIndex,
        rowIndex,
        fieldIndex,
    } = formSelections;

    useEffect(() => {
        const form = createForm(values);
        const entry = getEntryInitialValues(form);

        setPreviewForm({ form, entry });
    }, [ formSelections ]);

    useEffect(() => {
        dispatch('SET_DRAWER_VISIBLE', true);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV');
    }, []);

    function handleDiscard() {
        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.push('/(home)/index');
        }
    }

    function handleAddScreenPress(arrayHelper: FieldArrayRenderProps) {
        const position = values.screens.length;

        const field = createFieldConfig({
            name: `screens[${position}].rows[0].fields[0]`,
            type: 'TEXT',
            label: ''
        });
        const row = createFormRow({ fields: [field] });
        const newScreen = createFormScreenConfig({ title: '', position, rows: [row] });

        arrayHelper.push(newScreen);
        setFormSelections({
            screenIndex: position,
            rowIndex: 0,
            fieldIndex: 0,
        });
    }

    function handleEditFieldPress(fieldIndex: number) {
        setFormSelections({
            ...formSelections,
            fieldIndex,
        });
        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
        console.log(`Editing field ${fieldIndex}`);
    }

    function handleFieldPress(rowIndex: number, fieldIndex: number) {
        setFormSelections({
            ...formSelections,
            rowIndex,
            fieldIndex,
        });

        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
    }

    function handleAddFieldPress(arrayHelper: FieldArrayRenderProps) {
        const fieldIndex = selectedRow?.fields 
            ? selectedRow.fields.length 
            : -1;

        const name = `screens[${screenIndex}].rows[${rowIndex}].fields[${fieldIndex}]`;
        const newField = createFieldConfig({ name, type: 'TEXT', });

        arrayHelper.push(newField);

        setFormSelections({
            screenIndex,
            rowIndex,
            fieldIndex,
        });
    }

    function handleDeleteFieldPress(arrayHelper: FieldArrayRenderProps, fieldIndex: number) {
        arrayHelper.remove(fieldIndex);
    }

    function handleUpdateField(values: FormFieldConfig, formikHelpers: FormikHelpers<FormFieldConfig>) {

    }

    function handleRowPress(index: number) {
        setFormSelections({
            ...formSelections,
            rowIndex: index,
            fieldIndex: 0,
        });

        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleAddRowPress(rowArrayHelper: FieldArrayRenderProps) {
        const field = createFieldConfig({
            name: `screens[${screenIndex}].rows[${screen.rows.length}].fields[0]`,
            type: 'TEXT',
            label: ''
        });
        const row = createFormRow({ fields: [field] });
        rowArrayHelper.push(row);

        setFormSelections({
            screenIndex,
            rowIndex: screen.rows.length,
            fieldIndex: 0,
        });

        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleDeleteRowPress(rowArrayHelper: FieldArrayRenderProps) {
        const newRowIndex = screenIndex - 1;
        const newFieldIndex = newRowIndex === -1 ? -1 : 0;

        // console.log(`screens[${activeScreenIndex}].rows[${selectedRowIndex}]`)
        // console.log('rows:')
        // console.log(screen.rows)
        // console.log(`Removing row ${selectedRowIndex}`)
        setFormSelections({
            screenIndex,
            rowIndex: newRowIndex,
            fieldIndex: newFieldIndex,
        });

        rowArrayHelper.remove(rowIndex);
    }

    function handleMoveRow(dir: 'UP' | 'DOWN') {
        if (dir === 'UP') {
            const newRowIndex = rowIndex - 1;
            const row = screen.rows[newRowIndex];

            if (newRowIndex > -1) {
                setFormSelections({
                    screenIndex,
                    rowIndex: newRowIndex,
                    fieldIndex: row?.fields?.length ? 0 : -1,
                });
                
                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
            }
        }
        else {
            const newRowIndex = rowIndex + 1;
            const row = screen.rows[newRowIndex];

            if (newRowIndex < screen.rows.length) {
                setFormSelections({
                    screenIndex,
                    rowIndex: newRowIndex,
                    fieldIndex: row?.fields?.length ? 0 : -1,
                });
                
                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
            }
        }
    }

    function handleChangeFieldOrder(from: number, to: number, arrayHelper: FieldArrayRenderProps) {
        arrayHelper.move(from, to);

        setFormSelections({
            screenIndex,
            rowIndex,
            fieldIndex: to,
        });
    }

    function handleDeleteScreenPress(arrayHelper: FieldArrayRenderProps) {
        if (values.screens.length <= 1) {
            return;
        }

        arrayHelper.remove(screenIndex);

        const newScreen = values.screens[0];

        setFormSelections({
            screenIndex: 0,
            rowIndex: newScreen.rows.length -1,
            fieldIndex: -1,
        });
    }

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
            <Stack.Screen
                options={{
                    headerRight: () => (
                        <HeaderButtons 
                            onSubmitForm={handleSubmit} 
                            onDiscardForm={handleDiscard}
                        />
                    )
                }}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: 'green' }}>
                <FieldArray
                    name='screens'
                    render={arrayHelper => (
                        <View style={styles.page}>
                            <DrawerMenu
                                form={values}
                                onScreenChange={(newScreenIndex) => {
                                    setFormSelections({
                                        screenIndex: newScreenIndex,
                                        rowIndex: 0,
                                        fieldIndex: 0,
                                    })
                                }}
                                screens={values.screens}
                                screenIndex={screenIndex}
                                onAddScreenPress={() => handleAddScreenPress(arrayHelper)}
                                selectedRow={selectedRow}
                                selectedRowIndex={rowIndex}
                                onAddFieldPress={handleAddFieldPress}
                                onEditFieldPress={handleEditFieldPress}
                                selectedField={selectedField}
                                selectedFieldIndex={fieldIndex}
                                onDeleteFieldPress={handleDeleteFieldPress}
                                onDeleteRowPress={handleDeleteRowPress}
                                onChangeRowPress={handleRowPress}
                                onChangeFieldOrder={handleChangeFieldOrder}
                                onDeleteScreenPress={() => handleDeleteScreenPress(arrayHelper)}
                            />
                            <View style={styles.container}>
                                {
                                    screen && previewForm && (
                                        <FieldArray
                                            name={`screens[${screenIndex}].rows`}
                                            render={rowArrayHelper => (
                                                <DataCollectionForm
                                                    key={`screen-${screenIndex}`}
                                                    screenIndex={screenIndex}
                                                    selectedRowIndex={rowIndex}
                                                    setSelectedRowIndex={(rowIndex) => {
                                                        setFormSelections({
                                                            screenIndex,
                                                            rowIndex,
                                                            fieldIndex: 0,
                                                        })
                                                    }}
                                                    isDesignMode={true}
                                                    initialValues={previewForm.entry}
                                                    onSubmit={() => { }}
                                                    form={previewForm.form}
                                                    onAddRowPress={() => handleAddRowPress(rowArrayHelper)}
                                                    onChangeRowPress={handleMoveRow}
                                                    onRowPress={handleRowPress}
                                                    onFieldPress={handleFieldPress}
                                                />
                                            )}
                                        />
                                    )
                                }
                            </View>
                        </View>

                    )}
                />
            </ScrollView>
        </GestureHandlerRootView>

    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    activeText: {
        color: '#fff',
    },
    activeTab: {
        backgroundColor: theme.colors.secondary,
    },
    sectionBtnContainer: {
        marginBottom: 6,
        marginRight: 12,
        minWidth: 120,
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
        maxWidth: 150,
        marginBottom: 12,
    },
    formSectionTitle: {
        color: '#F56C00',
        fontWeight: '400',
    },
    container: {
        // no padding right, want extra finger space for selecting rows
        paddingTop: 24,
        paddingLeft: 12,
        maxWidth: 1200,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        flexGrow: 1,
    },
    formSection: {
        marginBottom: 12,
        backgroundColor: '#EDEDED',
        borderRadius: 0,
    },
    page: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'stretch',
        alignContent: 'stretch',
        flexGrow: 1,
        backgroundColor: theme.colors.surface,

    },
    imagePicker: {
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});