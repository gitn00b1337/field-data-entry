import { Formik, FormikConfig, FormikProps } from "formik";
import React from "react";
import { FormScreen, Direction } from "./form-screen";
import { FormEntryV2, } from "../lib/config";
import { FormGlobalButtons } from "./form-global-buttons";

export type DataCollectionFormProps<T> = {
    initialValues: T;
    onSubmit: (values: T) => void;
    form: FormEntryV2;
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex?: number;
    setSelectedRowIndex?: (number: number) => void;
    onRowPress?: (rowNumber: number) => void;
    onAddRowPress?: () => void;
    onChangeRowPress?: (direction: Direction) => void;
    onFieldPress?: (rowIndex: number, fueldIndex: number) => void;
    formRef?: React.Ref<FormikProps<T>>;
    onDiscardPress: (isDirty: boolean) => void;
    onDeleteFormPress: () => void;
    onExportForm?: (values: FormEntryV2) => void;
    onChangeScreen: (screenIndex: number) => void;
}

export function DataCollectionForm({
    initialValues,
    onSubmit,
    form,
    screenIndex,
    isDesignMode,
    selectedRowIndex,
    setSelectedRowIndex,
    onRowPress,
    onAddRowPress,
    onChangeRowPress,
    onFieldPress,
    formRef,
    onDiscardPress,
    onDeleteFormPress,
    onExportForm,
    onChangeScreen,
}: DataCollectionFormProps<FormEntryV2>) {
    if (!form?.config) {
        return null;
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            innerRef={formRef}
            enableReinitialize
        >
        {({ values, submitForm, dirty, }) => (
            <>
                <FormScreen
                    form={values}
                    screenIndex={screenIndex}
                    isDesignMode={isDesignMode}
                    selectedRowIndex={selectedRowIndex}
                    onRowPress={onRowPress}
                    onFieldPress={onFieldPress}    
                    onSubmit={submitForm}     
                    onChangeScreen={onChangeScreen}      
                    entry={values.values}     
                />
                <FormGlobalButtons 
                    isDesignMode={isDesignMode}
                    fields={form.config.globalFields}
                    onAddRowPress={onAddRowPress}
                    onChangeRowPress={onChangeRowPress}
                    onSubmitForm={submitForm}
                    onDiscardForm={() => onDiscardPress(dirty)}
                    onDeleteForm={onDeleteFormPress}
                    onExportForm={() => onExportForm(values)}
                />
            </>
        )}
        </Formik>
    )
}

function FormWrap({
    isDesignMode,
    children,
    initialValues,
    onSubmit,
    innerRef,
}: {
    isDesignMode: boolean;
    children: ((props: FormikProps<FormEntryV2>) => React.ReactNode) | React.ReactNode;
} & FormikConfig<FormEntryV2>) {
    if (isDesignMode) {
        return (
            <>
                { children }
            </>
        )           
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            innerRef={innerRef}
        >
        {children}
        </Formik>
    )
}
