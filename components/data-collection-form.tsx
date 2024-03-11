import React from "react";
import { FormScreen, Direction } from "./form-screen";
import { FormEntryV2, FormRow, } from "../lib/config";
import { FormGlobalButtons } from "./form-global-buttons";
import { Control, UseFormReturn, useForm } from "react-hook-form";

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
}: DataCollectionFormContentProps<FormEntryV2>) {
    if (!form?.getValues().config) {
        return null;
    }

    return (
        <>
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
            />
        </>
    )
}

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