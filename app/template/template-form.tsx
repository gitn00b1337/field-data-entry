import { ScrollView, StyleSheet, View, } from "react-native";
import {  FormEntryV2, FormRow, FormScreenConfig, createFieldConfig, createFormRow, createFormScreenConfig, } from "../../lib/config";
import { useTheme, MD3Theme, } from 'react-native-paper';
import React, { useEffect, useRef, useState } from "react";
import { DrawerMenu } from "./drawer";
import { useGlobalState } from "../global-state";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, } from "expo-router";
import { deleteConfiguration } from "../../lib/database";
import { FormSnackbar, FormSnackbarType } from "../../components/form-snackbar";
import { LeaveFormDialog } from "./leave-form-dialog";
import { DeleteFormDialog } from "./delete-form.dialog";
import { useForm, } from "react-hook-form";
import { DataCollectionFormContent } from "../../components/data-collection-form";
import { DeviceMotion, DeviceMotionOrientation } from 'expo-sensors'
import { exportTemplate } from "../../lib/form-export";

export type TemplateFormProps = {
    initialValues?: FormEntryV2;
    onSubmit: (entry: FormEntryV2) => Promise<void>;
}

export function TemplateForm({ initialValues, onSubmit }: TemplateFormProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [_, dispatch] = useGlobalState();
    const router = useRouter();
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const subscription = DeviceMotion.addListener(({ orientation }) => {
            const isPortrait = orientation == DeviceMotionOrientation.Portrait
                || orientation == DeviceMotionOrientation.UpsideDown;

            setIsPortrait(isPortrait);
        });

        return () => DeviceMotion.removeSubscription(subscription);
    }, []);

    const [screenIndex, setScreenIndex] = useState(0);
    const [rowIndex, setRowIndex] = useState(-1);
    const [fieldIndex, setFieldIndex] = useState(-1);
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const form = useForm<FormEntryV2>({
        defaultValues: initialValues,
      });

    const {
        control,
        watch,
        formState: { isDirty, },
        setValue,
    } = form;
    
    const screens = form.watch(`config.screens`);
    const screen = screens[screenIndex];
    const rows = form.watch(`config.screens.${screenIndex}.rows`);
    const formName = form.watch('config.name');

    // BUG: react hook forms watch() doesn't detect the removeRow in the preview form if useFieldArray is used, 
    // causing multiple issues. 
    // using setValue and force replacing the entire array works, performance is OK. Same issue with screens.
    // const {
    //     fields: rows,
    //     insert: insertRow,
    //     remove: removeRow,
    // } = useFieldArray({
    //     control: form.control,
    //     name: `config.screens.${screenIndex}.rows`,
    // });

    function insertRow(index: number, row: FormRow) {
        const newRows = [
            ...rows.slice(0, index),
            row,
            ...rows.slice(index)
        ];
        setValue(`config.screens.${screenIndex}.rows`, newRows);
    }

    function removeRow(index: number) {
        const newRows = [
            ...rows.slice(0, index),
            ...rows.slice(index + 1)
        ];
        setValue(`config.screens.${screenIndex}.rows`, newRows);
    }

    function appendScreen(newScreen: FormScreenConfig) {
        const newScreens = [
            ...screens.slice(0),
            newScreen
        ];
        setValue(`config.screens`, newScreens);
    }

    function removeScreen(index: number) {
        console.log(`Deleting screen ${index}`)
        const newScreens = [
            ...screens.slice(0, index),
            ...screens.slice(index + 1)
        ];
        setValue(`config.screens`, newScreens);
    }

    useEffect(() => {
        dispatch('SET_DRAWER_VISIBLE', true);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'SETTINGS');
    }, []);

    async function handleDeleteForm() {
        try {
            const configId = initialValues?.config?.id;

            if (configId) {
                await deleteConfiguration(configId);
            }
            
            router.replace('/');
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured deleting, please try again.' });
        }
    }

    async function handleSaveAndQuit() {
        try {
            await formSubmit();
            router.replace('/');
        }
        catch (e) {
            console.error(e);
            setSnackbarOptions({ type: 'ERROR', message: e?.message || 'An error occured deleting, please try again.' });
        }

    }

    function handleDiscard() {
        if (isDirty) {
            setShowLeaveDialog(true);
            return;
        }

        if (router.canGoBack()) {
            router.back();
        }
        else {
            router.navigate('/');
        }
    }

    function handleAddScreen() {
        const position = screens.length;

        const field = createFieldConfig({
            name: `screens[${position}].rows[0].fields[0]`,
            type: 'TEXT',
            label: ''
        });
        const row = createFormRow({ fields: [field] });
        const newScreen = createFormScreenConfig({ title: '', position, rows: [row] });

        appendScreen(newScreen);

        setScreenIndex(position);
        setRowIndex(0);
        setFieldIndex(0);
    }

    function handleEditFieldPress(fieldIndex: number) {
        setFieldIndex(fieldIndex);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
    }

    function handleFieldPress(rowIndex: number, fieldIndex: number) {
        console.log(`FIELD PRESS, row ${rowIndex}, field ${fieldIndex}`)
        setRowIndex(rowIndex);
        setFieldIndex(fieldIndex);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'FIELD');
    }

    function handleRowPress(index: number) {
        setRowIndex(index);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleDeleteRow(rowToDeleteIndex: number) {
        if (rows.length === 1) {
            return;
        }

        console.log(`Deleting row:: ${rowToDeleteIndex}`)
        removeRow(rowToDeleteIndex);
        
        if (rowToDeleteIndex === rowIndex) {
            if (rowIndex === rows.length - 1) {
                const newIndex = rowIndex - 1;
                const fields = rows[newIndex]?.fields || [];

                setRowIndex(newIndex);
                setFieldIndex(fields.length ? 0 : -1);
            }
        }
        else if (rowToDeleteIndex < rowIndex) {
            // lost a previous item in row, so to preserve
            // the selection, need to jump down one
            setRowIndex(rowIndex - 1);
        }
    }

    function handleAddRow() {
        const screen = screens[screenIndex];
        const name = `config.screens[${screenIndex}].rows[${screen.rows.length}].fields[0]`;

        const field = createFieldConfig({
        name,
            type: 'TEXT',
            label: ''
        });

        const row = createFormRow({ fields: [field] });
        insertRow(rowIndex + 1, row);

        setRowIndex(rowIndex + 1);
        setFieldIndex(0);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleDeleteScreen(indexToDelete: number) {
        if (screens.length === 1) {
            return;
        }

        removeScreen(indexToDelete);

        if (indexToDelete === screenIndex) {
            const newIndex = screenIndex - 1;
            const rows = screens[newIndex]?.rows || [];
            const fields = rows[0]?.fields || [];

            setScreenIndex(newIndex);
            setRowIndex(rows.length ? 0 : -1);
            setFieldIndex(fields.length ? 0 : -1);
        }
        else if (indexToDelete < screenIndex) {
            // lost a previous screen, so to preserve
            // the selection, need to jump down one
            setScreenIndex(screenIndex - 1);
        }
    }

    function handleMoveRow(dir: 'UP' | 'DOWN') {
        const screen = screens[screenIndex];

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

    async function handleExportTemplate() {
        try {
            const values = form.getValues();
            await exportTemplate(values.config);
            setSnackbarOptions({ type: 'SUCCESS', message: `Form exported!` });
        }
        catch (e) {
            setSnackbarOptions({ type: 'ERROR', message: 'An error occured exporting, please try again.' });
            console.error(e);
        }
    }

    const formSubmit = form.handleSubmit(onSubmit);

    return (
        <GestureHandlerRootView style={{ flex: 1, }}>
            <LeaveFormDialog
                isVisible={showLeaveDialog}
                onHideModal={() => setShowLeaveDialog(false)}
                onSaveAndQuit={handleSaveAndQuit}
            />
            <DeleteFormDialog
                isVisible={showDeleteDialog}
                onHideModal={() => setShowDeleteDialog(false)}
                onDelete={handleDeleteForm}
            />
            <View style={[{ flex: 1, }, isPortrait && { flexDirection: 'column' }]}>
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
                <View style={[styles.page, isPortrait && styles.portraitPage]}>
                    {
                        !isPortrait && (
                            <DrawerMenu
                                onScreenChange={(newScreenIndex) => {
                                    setScreenIndex(newScreenIndex);
                                    setRowIndex(0);
                                    setFieldIndex(0);
                                    dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
                                }}
                                screenIndex={screenIndex}
                                onAddScreen={handleAddScreen}
                                selectedRowIndex={rowIndex}
                                onFieldAdded={fieldIndex => setFieldIndex(fieldIndex)}
                                onEditFieldPress={handleEditFieldPress}
                                selectedFieldIndex={fieldIndex}
                                setValue={setValue}
                                control={control}
                                onDeleteRow={handleDeleteRow}
                                onFieldDeleted={(fi) => handleFieldPress(rowIndex, fi)}
                                onRowPress={handleRowPress}
                                onDeleteScreen={handleDeleteScreen}
                                onAddRow={handleAddRow}
                            />
                        )
                    }
                    <View style={[styles.container]}>
                        <ScrollView>
                        {
                            screen && (
                                <DataCollectionFormContent
                                    key={`screen-${screenIndex}`}
                                    form={form}
                                    screenIndex={screenIndex}
                                    selectedRowIndex={rowIndex}
                                    setSelectedRowIndex={(rowIndex) => {
                                        setRowIndex(rowIndex);
                                        setFieldIndex(0);
                                    }}
                                    isDesignMode={true}
                                    initialValues={initialValues}
                                    onSubmit={() => formSubmit()}
                                    onChangeRowPress={handleMoveRow}
                                    onRowPress={handleRowPress}
                                    onFieldPress={handleFieldPress}
                                    onDiscardPress={handleDiscard}
                                    onDeleteFormPress={() => setShowDeleteDialog(true)}
                                    onChangeScreen={screenIndex => setScreenIndex(screenIndex)}
                                    submitForm={() => formSubmit()}
                                    onExportForm={handleExportTemplate}
                                    formName={formName}
                                />
                            )
                        }
                        </ScrollView>
                    </View>
                </View>
                {
                    isPortrait && (
                        <DrawerMenu
                            onScreenChange={(newScreenIndex) => {
                                setScreenIndex(newScreenIndex);
                                setRowIndex(0);
                                setFieldIndex(0);
                                dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
                            }}
                            screenIndex={screenIndex}
                            onAddScreen={handleAddScreen}
                            selectedRowIndex={rowIndex}
                            onFieldAdded={fieldIndex => setFieldIndex(fieldIndex)}
                            onEditFieldPress={handleEditFieldPress}
                            selectedFieldIndex={fieldIndex}
                            setValue={setValue}
                            control={control}
                            onDeleteRow={handleDeleteRow}
                            onFieldDeleted={(fi) => handleFieldPress(rowIndex, fi)}
                            onRowPress={handleRowPress}
                            onDeleteScreen={handleDeleteScreen}
                            onAddRow={handleAddRow}
                        />
                    )
                }
            </View>
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
        // maxWidth: 1200,
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        width: '65%',
        marginHorizontal: 'auto',
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
        flex: 1,
        backgroundColor: '#fff',
    },
    portraitPage: {
    },
    imagePicker: {
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});