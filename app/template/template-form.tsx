import { ScrollView, StyleSheet, View, } from "react-native";
import { FormConfig, FormFieldConfig, createFieldConfig, createFormRow, createFormScreenConfig, createFormV2 } from "../../lib/config";
import { useTheme, MD3Theme, } from 'react-native-paper';
import {  FieldArray, FieldArrayRenderProps, FormikProps, FormikHelpers } from 'formik';
import { useEffect, useMemo, useState } from "react";
import { DrawerMenu } from "./drawer";
import { useGlobalState } from "../global-state";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DataCollectionForm } from "../../components/data-collection-form";
import { useRouter, } from "expo-router";
import { deleteConfiguration } from "../../lib/database";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";

export type TemplateFormProps = {
    showDrawer: boolean;
} & FormikProps<FormConfig>

export function TemplateForm({ showDrawer, ...formProps }: TemplateFormProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [state, dispatch] = useGlobalState();
    const router = useRouter();

    const [screenIndex, setScreenIndex] = useState(0);
    const [rowIndex, setRowIndex] = useState(-1);
    const [fieldIndex, setFieldIndex] = useState(-1);

    const { values } = formProps; 
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const previewForm = useMemo(() => createFormV2(values), [ /* values */ ]);

    useEffect(() => {
        dispatch('SET_DRAWER_VISIBLE', true);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'NAV');
    }, []);

    useMemo(() => {
        console.log('TEMPLATE FORM RE_RENDER');
    }, [ values ])

    async function handleDeleteFormPress() {
        try {
            await deleteConfiguration(values);
            router.replace('/');
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured deleting, please try again.' });
        }
    }

    function handleDiscard() {
        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.push('/');
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
        setScreenIndex(position);
    }

    function handleEditFieldPress(fieldIndex: number) {
        setFieldIndex(fieldIndex);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
    }

    function handleFieldPress(rowIndex: number, fieldIndex: number) {
        setRowIndex(rowIndex);
        setFieldIndex(fieldIndex);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
    }

    function handleAddFieldPress(arrayHelper: FieldArrayRenderProps) {
        const selectedRow = values.screens[screenIndex]?.rows[rowIndex];
        const fieldIndex = selectedRow?.fields 
            ? selectedRow.fields.length 
            : -1;

        const name = `screens[${screenIndex}].rows[${rowIndex}].fields[${fieldIndex}]`;
        const newField = createFieldConfig({ name, type: 'TEXT', });

        arrayHelper.push(newField);

        setFieldIndex(fieldIndex);
    }

    function handleDeleteFieldPress(arrayHelper: FieldArrayRenderProps, fieldIndex: number) {
        arrayHelper.remove(fieldIndex);
    }

    function handleUpdateField(values: FormFieldConfig, formikHelpers: FormikHelpers<FormFieldConfig>) {

    }

    function handleRowPress(index: number) {
        setRowIndex(index);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleAddRowPress(rowArrayHelper: FieldArrayRenderProps) {
        const screen = values.screens[screenIndex];
        const name = `screens[${screenIndex}].rows[${screen.rows.length}].fields[0]`;

        const field = createFieldConfig({
            name,
            type: 'TEXT',
            label: ''
        });

        const row = createFormRow({ fields: [field] });
        rowArrayHelper.push(row);

        setRowIndex(screen.rows.length);
        setFieldIndex(0);

        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleDeleteRowPress(rowArrayHelper: FieldArrayRenderProps) {
        const newRowIndex = screenIndex - 1;
        const newFieldIndex = newRowIndex === -1 ? -1 : 0;

        setRowIndex(newRowIndex);
        setFieldIndex(newFieldIndex);

        rowArrayHelper.remove(rowIndex);
    }

    function handleMoveRow(dir: 'UP' | 'DOWN') {
        const screen = values.screens[screenIndex];

        if (dir === 'UP') {
            const newRowIndex = rowIndex - 1;
            const row = screen.rows[newRowIndex];

            if (newRowIndex > -1) {
                setRowIndex(newRowIndex);
                setFieldIndex(row?.fields?.length ? 0 : -1);
                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
            }
        }
        else {
            const newRowIndex = rowIndex + 1;
            const row = screen.rows[newRowIndex];

            if (newRowIndex < screen.rows.length) {
                setRowIndex(newRowIndex);             
                setFieldIndex(row?.fields?.length ? 0 : -1);   
                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
            }
        }
    }

    function handleChangeFieldOrder(from: number, to: number, arrayHelper: FieldArrayRenderProps) {
        arrayHelper.move(from, to);
        setFieldIndex(to);
    }

    function handleDeleteScreenPress(arrayHelper: FieldArrayRenderProps) {
        if (values.screens.length <= 1) {
            return;
        }

        arrayHelper.remove(screenIndex);

        const newScreen = values.screens[0];
        setScreenIndex(0);
        setRowIndex(newScreen.rows.length - 1);
        setFieldIndex(-1);
    }

    function handleChangeScreenIndex(screenIndex: number) {
        setScreenIndex(screenIndex);
    }

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: 'green' }}>
                {
                    !!snackbarOptions && (
                        <FormSnackbar
                            visible={!!snackbarOptions}
                            onClose={() => setSnackbarOptions(undefined)}
                            label={snackbarOptions?.message}
                            type={snackbarOptions?.type}
                        />
                    )
                }
                <FieldArray
                    name='screens'
                    render={arrayHelper => (
                        <View style={styles.page}>
                            <DrawerMenu
                                form={values}
                                onScreenChange={(newScreenIndex) => {
                                    setScreenIndex(newScreenIndex);
                                    setRowIndex(0);
                                    setFieldIndex(0);
                                }}
                                screens={values.screens}
                                screenIndex={screenIndex}
                                onAddScreenPress={() => handleAddScreenPress(arrayHelper)}
                                selectedRowIndex={rowIndex}
                                onAddFieldPress={handleAddFieldPress}
                                onEditFieldPress={handleEditFieldPress}
                                selectedFieldIndex={fieldIndex}
                                onDeleteFieldPress={handleDeleteFieldPress}
                                onDeleteRowPress={handleDeleteRowPress}
                                onChangeRowPress={handleRowPress}
                                onChangeFieldOrder={handleChangeFieldOrder}
                                onDeleteScreenPress={() => handleDeleteScreenPress(arrayHelper)}
                            />
                            <View style={styles.container}>
                                {
                                    values.screens[screenIndex] && (
                                        <FieldArray
                                            name={`screens[${screenIndex}].rows`}
                                            render={rowArrayHelper => (
                                                <DataCollectionForm
                                                    key={`screen-${screenIndex}`}
                                                    screenIndex={screenIndex}
                                                    selectedRowIndex={rowIndex}
                                                    setSelectedRowIndex={(rowIndex) => {
                                                        setRowIndex(rowIndex);
                                                        setFieldIndex(0);
                                                    }}
                                                    isDesignMode={true}
                                                    initialValues={previewForm}
                                                    onSubmit={() => formProps.submitForm()}
                                                    form={values}
                                                    onAddRowPress={() => handleAddRowPress(rowArrayHelper)}
                                                    onChangeRowPress={handleMoveRow}
                                                    onRowPress={handleRowPress}
                                                    onFieldPress={handleFieldPress}
                                                    onDiscardPress={handleDiscard}
                                                    onDeleteFormPress={handleDeleteFormPress}
                                                    onChangeScreen={handleChangeScreenIndex}
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