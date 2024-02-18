import { FieldArray, Formik } from "formik";
import { View, StyleSheet } from "react-native";
import { Form } from "../lib/form";
import { FormScreenConfig } from "../lib/config";
import { FormField } from "./form-field";
import { MD3Theme, useTheme, Text } from "react-native-paper";
import React from "react";
import { FormConfigRow } from "../app/template/row";
import { DataCollectionFormScreen, Direction } from "./data-collection-form-screen";

export type DataCollectionFormProps<T> = {
    initialValues: T;
    onSubmit: (values: T) => void;
    form: Form;
    screenIndex: number;
    isDesignMode: boolean;
    selectedRowIndex?: number;
    setSelectedRowIndex?: (number: number) => void;
    onRowPress?: (rowNumber: number) => void;
    onAddRowPress?: () => void;
    onChangeRowPress?: (direction: Direction) => void;
    onFieldPress?: (rowIndex: number, fueldIndex: number) => void;
}

export function DataCollectionForm<T>({
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
}: DataCollectionFormProps<T>) {
    if (!form) {
        return null;
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
        >
        {({ values, submitForm }) => (
            <DataCollectionFormScreen
                onSubmit={onSubmit}
                form={form}
                screenIndex={screenIndex}
                isDesignMode={isDesignMode}
                selectedRowIndex={selectedRowIndex}
                setSelectedRowIndex={setSelectedRowIndex}
                onAddRowPress={onAddRowPress}
                onChangeRowPress={onChangeRowPress}
                onRowPress={onRowPress}
                onFieldPress={onFieldPress}
            />
        )}
        </Formik>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    row: {
        width: '100%',
        paddingBottom: 12,
        flexDirection: 'row',
    }
});