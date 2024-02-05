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
import { createForm, getEntryInitialValues } from "../../lib/form";
import { Stack, } from "expo-router";
import { HeaderButtons } from "./header-buttons";

export type TemplateFormProps = {
    showDrawer: boolean;
} & FormikProps<FormConfig>

export function TemplateForm({ handleSubmit, values, }: TemplateFormProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [activeScreenIndex, setActiveScreenIndex] = useState(0);
    const [state, dispatch] = useGlobalState();
    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedFieldIndex, setSelectedFieldIndex] = useState(-1);

    const screen = values.screens ? values.screens[activeScreenIndex] : undefined;
    const selectedRow: FormRow | undefined = screen?.rows[selectedRowIndex];
    const selectedField: FormFieldConfig | undefined = selectedRow?.fields[selectedFieldIndex];

    const previewForm = createForm(values);
    const formPreviewInitialValues = getEntryInitialValues(previewForm);

    useEffect(() => {
        dispatch('SET_DRAWER_VISIBLE', true);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV');
    }, []);

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
        setActiveScreenIndex(position);
        setSelectedRowIndex(0);
    }

    function handleEditFieldPress(fieldIndex: number) {
        setSelectedFieldIndex(fieldIndex);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
        console.log(`Editing field ${fieldIndex}`);
    }

    function handleFieldPress(fieldIndex: number) {
        setSelectedFieldIndex(fieldIndex);
        setDialogVisible(true);
    }

    function handleAddFieldPress(arrayHelper: FieldArrayRenderProps) {
        const name = `screens[${activeScreenIndex}].rows[${selectedRowIndex}].fields[${selectedRow.fields.length}]`;
        const newField = createFieldConfig({ name, type: 'TEXT', });

        arrayHelper.push(newField);
    }

    function handleUpdateField(values: FormFieldConfig, formikHelpers: FormikHelpers<FormFieldConfig>) {

    }

    function handleRowPress(index: number) {
        setSelectedRowIndex(index);
        setSelectedFieldIndex(0);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleAddRowPress(rowArrayHelper: FieldArrayRenderProps) {
        const field = createFieldConfig({
            name: `screens[${activeScreenIndex}].rows[${screen.rows.length}].fields[0]`,
            type: 'TEXT',
            label: ''
        });
        const row = createFormRow({ fields: [field] });
        rowArrayHelper.push(row);
        setSelectedRowIndex(screen.rows.length);
        setSelectedFieldIndex(0);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleMoveRow(dir: 'UP' | 'DOWN') {
        if (dir === 'UP') {
            const newRowIndex = selectedRowIndex - 1;
            const row = screen.rows[newRowIndex];

            if (newRowIndex > -1) {
                setSelectedRowIndex(newRowIndex);
                setSelectedFieldIndex(row?.fields?.length ? 0 : -1);
                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
            }
        }
        else {
            const newRowIndex = selectedRowIndex + 1;
            const row = screen.rows[newRowIndex];

            if (newRowIndex < screen.rows.length) {
                setSelectedRowIndex(newRowIndex);
                setSelectedFieldIndex(row?.fields?.length ? 0 : -1);
                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
            }
        }
    }

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
            <Stack.Screen
                options={{
                    headerRight: () => <HeaderButtons onSubmitForm={handleSubmit} />
                }}
            />
            <ScrollView contentContainerStyle={{ flexGrow: 1, }}>
                <FieldArray
                    name='screens'
                    render={arrayHelper => (
                        <View style={styles.page}>
                            <DrawerMenu
                                onScreenChange={setActiveScreenIndex}
                                screens={values.screens}
                                screenIndex={activeScreenIndex}
                                onAddScreenPress={() => handleAddScreenPress(arrayHelper)}
                                selectedRow={selectedRow}
                                selectedRowIndex={selectedRowIndex}
                                onFieldPress={handleFieldPress}
                                onAddFieldPress={handleAddFieldPress}
                                onEditFieldPress={handleEditFieldPress}
                                selectedField={selectedField}
                                selectedFieldIndex={selectedFieldIndex}
                            />
                            <View style={styles.container}>
                                {
                                    !screen && (
                                        <Card mode='contained' style={styles.formSection}>
                                            <Card.Title title="Details" titleStyle={styles.formSectionTitle} />
                                            <Card.Content>
                                                <FormInput
                                                    fieldName='name'
                                                    label='Name'
                                                    value={values.name}
                                                />
                                                <FormInput
                                                    fieldName='description'
                                                    label='Description'
                                                    value={values.description}
                                                />
                                            </Card.Content>
                                        </Card>
                                    )
                                }
                                {
                                    screen && (
                                        <FieldArray
                                            name={`screens[${activeScreenIndex}].rows`}
                                            render={rowArrayHelper => (
                                                <DataCollectionForm
                                                    screenIndex={activeScreenIndex}
                                                    key={`screen-${activeScreenIndex}`}
                                                    selectedRowIndex={selectedRowIndex}
                                                    setSelectedRowIndex={setSelectedRowIndex}
                                                    isDesignMode={true}
                                                    initialValues={formPreviewInitialValues}
                                                    onSubmit={() => { }}
                                                    form={previewForm}
                                                    onAddRowPress={() => handleAddRowPress(rowArrayHelper)}
                                                    onChangeRowPress={handleMoveRow}
                                                    onRowPress={handleRowPress}
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