import { ScrollView, StyleSheet, View, } from "react-native";
import {  FormEntryV2, FormRow, createFieldConfig, createFormRow, createFormScreenConfig, } from "../../lib/config";
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
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { DataCollectionFormContent } from "../../components/data-collection-form";

export type TemplateFormProps = {
    initialValues?: FormEntryV2;
    onSubmit: (entry: FormEntryV2) => Promise<void>;
}

export function TemplateForm({ initialValues, onSubmit }: TemplateFormProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [_, dispatch] = useGlobalState();
    const router = useRouter();

    const [screenIndex, setScreenIndex] = useState(0);
    const [configId, setConfigId] = useState(initialValues?.config?.id);
    const [rowIndex, setRowIndex] = useState(-1);
    const [fieldIndex, setFieldIndex] = useState(-1);
    const [snackbarOptions, setSnackbarOptions] = useState<{ type: FormSnackbarType, message: string } | undefined>();
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleSubmit: SubmitHandler<FormEntryV2> = async (data) => {
        console.log(data)
    }

    const form = useForm<FormEntryV2>({
        defaultValues: initialValues,
      });

    const {
        control,
        watch,
        formState: { isDirty, },
        setValue,
    } = form;

    const {
        fields: screens,
        append: appendScreen,
        remove: removeScreen,
    } = useFieldArray({
        control,
        name: `config.screens`
    });

    const {
        fields: rows,
        append: appendRow,
        insert: insertRow,
        remove: removeRow,
    } = useFieldArray({
        control: form.control,
        name: `config.screens.${screenIndex}.rows`,
    });
    
    const screen = screens[screenIndex];

    useEffect(() => {
        dispatch('SET_DRAWER_VISIBLE', true);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'SETTINGS');
    }, []);

    console.log('TEMPLATE FORM RE_RENDER');

    async function handleDeleteForm() {
        try {
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
            router.push('/');
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

    function handleRowPress(index: number) {
        setRowIndex(index);
        dispatch('SET_DRAWER_CONFIG_TYPE', 'ROW');
    }

    function handleDeleteRow(rowToDeleteIndex: number) {
        removeRow(rowToDeleteIndex);
        
        if (rowToDeleteIndex !== rowIndex) {
            return;
        }

        const newRowIndex = getNewIndexOnDeleted(screen?.rows || [], rowToDeleteIndex);
        const newFieldIndex = newRowIndex === -1 ? -1 : 0;

        setRowIndex(newRowIndex);
        setFieldIndex(newFieldIndex);
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

    function getNewIndexOnDeleted(arr: any[] = [], deletedIndex: number) {
        if (arr.length < 2) {
            return -1;
        }

        if (deletedIndex === 0) {
            return deletedIndex + 1;
        }

        return deletedIndex - 1;
    }

    function handleDeleteScreen(index: number) {
        removeScreen(screenIndex);

        if (screenIndex !== index) {
            return;
        }

        const newScreenIndex = getNewIndexOnDeleted(screens, index);
        setScreenIndex(newScreenIndex);

        const screen = screens[newScreenIndex];
        const rowCount = screen?.rows?.length || 0;
        const newRowIndex = rowCount > 0 ? 0 : -1;
        setRowIndex(newRowIndex);

        const fieldCount = screen?.rows[newRowIndex]?.fields?.length || 0;
        const newFieldIndex = fieldCount > 0 ? 0 : -1;
        setFieldIndex(newFieldIndex);
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

    const formSubmit = form.handleSubmit(onSubmit);

    return (
        <GestureHandlerRootView style={{ flexGrow: 1, }}>
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
                <View style={styles.page}>
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
                    <View style={styles.container}>
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
                                />
                            )
                        }
                    </View>
                </View>
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