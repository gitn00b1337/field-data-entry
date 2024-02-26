import { useEffect, useState } from "react";
import { useField } from 'formik';
import { View, StyleSheet, Text } from "react-native";
import { MultiSelect, } from 'react-native-element-dropdown';
import { MD3Theme, useTheme } from "react-native-paper";
import { deferredEffect } from "../lib/effect";

export type FormMultiSelectFieldProps = {
    fieldName: string;
    label: string;
    options: {
        label: string;
        value: string;
    }[];
    onFocus?: () => void;
    hasAllOption?: boolean;
    allOptionLabel?: string;
    onChange?: (vals: string[]) => void;
}

export function FormMultiSelectField({
    fieldName,
    label,
    options,
    onFocus,
    hasAllOption = false,
    allOptionLabel = 'All Options',
    onChange,
}: FormMultiSelectFieldProps) {
    const [field, meta, helpers] = useField(fieldName);
    const [isFocus, setIsFocus] = useState(false);
    const [placeholder, setPlaceholder] = useState(getPlaceholder);

    const theme = useTheme();
    const styles = makeStyles(theme);

    // console.log('field value::')
    // console.log(field.value)

    useEffect(() => {
        if (isFocus && onFocus) {
            onFocus();
        }
    }, [isFocus]);

    deferredEffect(() => {
        const newPlaceholder = getPlaceholder();
        setPlaceholder(newPlaceholder);

        if (typeof onChange === 'function') {
            onChange(field.value);
        }
    }, [ field.value ]);

    function getPlaceholder() {
        if (hasAllOption && !field.value?.length) {
            return allOptionLabel;
        }

        if (!Array.isArray(field.value) || field.value.length < 1) {
            return 'Select items...';
        }

        return options.filter(op => field.value.indexOf(op.value) > -1)
            .reduce((str, op, index) => {
                if (index === 0) {
                    return op.label;
                }

                return `${str}, ${op.label}`;
            }, '')
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.label, isFocus && { color: theme.colors.primary }]}>
                {label}
            </Text>
            <MultiSelect
                style={[styles.dropdown, isFocus && { borderColor: theme.colors.primary }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={options}
                search
                maxHeight={300}
                labelField={'label'}
                valueField={'value'}
                placeholder={placeholder}
                searchPlaceholder="Search..."
                itemContainerStyle={{ marginLeft: 0, paddingLeft: 0, left: 0 }}
                value={field.value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={values => {
                    helpers.setValue(values);
                    setIsFocus(false);
                }}
                visibleSelectedItem={false}
            />
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingTop: 16,
        borderTopRightRadius: 4,
        borderTopLeftRadius: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
        flexGrow: 1,
    },
    dropdown: {
        height: 40,
        paddingHorizontal: 4,
        paddingBottom: 0,
        marginBottom: 0,
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 8,
        top: 7,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 12,
    },
    placeholderStyle: {
        fontSize: 16,
        paddingLeft: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
        color: theme.colors.onSurface,
        paddingLeft: 12,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        borderRadius: 2,
    },
});