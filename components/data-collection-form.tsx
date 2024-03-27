import React from "react";
import { FormScreen, Direction } from "./form-screen";
import { FormEntryV2, FormRow, } from "../lib/config";
import { FormGlobalButtons } from "./form-global-buttons";
import { UseFormReturn, useForm } from "react-hook-form";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export type DataCollectionFormProps<T> = {  
    initialValues: T;
    onSubmit: (values: T) => void;
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex?: number;
    setSelectedRowIndex?: (number: number) => void;
    onRowPress?: (rowNumber: number) => void;
    onChangeRowPress?: (direction: Direction) => void;
    onFieldPress?: (rowIndex: number, fueldIndex: number) => void;
    onDiscardPress: (isDirty: boolean) => void;
    onDeleteFormPress: () => void;
    onExportForm?: (values: FormEntryV2) => void;
    onChangeScreen: (screenIndex: number) => void;
    formName?: string;
};

export type DataCollectionFormContentProps<T> = {  
    form: UseFormReturn<FormEntryV2, any>;
    submitForm: () => Promise<void>;
} & DataCollectionFormProps<T>;

export function DataCollectionFormContent({
    form,
    screenIndex,
    isDesignMode,
    selectedRowIndex,
    onRowPress,
    onChangeRowPress,
    onFieldPress,
    onDiscardPress,
    onDeleteFormPress,
    onExportForm,
    onChangeScreen,
    submitForm,
    formName,
}: DataCollectionFormContentProps<FormEntryV2>) {
    const formValues = form?.getValues();

    if (!formValues.config) {
        return null;
    }

    const screenCount = formValues.config.screens.length;

    return (
        <>
            <View>
                    <Text style={styles.header}>{formName || formValues.config.name || 'Data Collection'}</Text>
            </View>
            <FormScreen
                form={form}
                screenIndex={screenIndex}
                isDesignMode={isDesignMode}
                selectedRowIndex={selectedRowIndex}
                onRowPress={onRowPress}
                onFieldPress={onFieldPress}    
                onSubmit={submitForm}     
                onChangeScreen={onChangeScreen}
            />
            <FormGlobalButtons 
                control={form.control}
                isDesignMode={isDesignMode}
                onChangeRowPress={onChangeRowPress}
                onSubmitForm={submitForm}
                onDiscardForm={() => onDiscardPress(form.formState.isDirty)}
                onDeleteForm={onDeleteFormPress}
                onExportForm={() => onExportForm(form.getValues())}
                screenIndex={screenIndex}
                onChangeScreen={onChangeScreen}
                screenCount={screenCount}
                onSubmit={submitForm}     
            />
        </>
    )
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        alignSelf: 'center',
        paddingVertical: 24,
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        rowGap: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
});

export function DataCollectionForm(props: DataCollectionFormProps<FormEntryV2>) {
    const form = useForm({
        defaultValues: props.initialValues,
    });

    return (
        <DataCollectionFormContent
            {...props}
            form={form}
            submitForm={form.handleSubmit(props.onSubmit)}
        />
    )
}