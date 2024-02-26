import { useEffect, useState } from "react";
import { useField } from 'formik';
import { View, StyleSheet, Text } from "react-native";
import { FormFieldProps } from "./form-field";
import { Dropdown, } from 'react-native-element-dropdown';
import { MD3Theme, useTheme } from "react-native-paper";
import { deferredEffect } from "../lib/effect";

export type FormSelectProps = {
    fieldName: string;
    label: string;
    options: {
        label: string;
        value: string;
    }[];
    onFocus?: () => void;
    onChange?: (val: string) => void;
}

export function FormSelectField({
    fieldName,
    label,
    options,
    onFocus,
    onChange,
}: FormSelectProps) {
    const [field, meta, helpers] = useField(fieldName);
    const [isFocus, setIsFocus] = useState(false);

    const theme = useTheme();
    const styles = makeStyles(theme);

    useEffect(() => {
        if (isFocus && onFocus) {
            onFocus();
        }
    }, [isFocus]);

    deferredEffect(() => {
      if (typeof onChange === 'function') {
        onChange(field.value);
      }   
    }, [ field.value ]);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, isFocus && { color: theme.colors.primary }]}>
                { label || 'New Field' }
            </Text>
            <Dropdown
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
                placeholder={'Select item'}
                searchPlaceholder="Search..."
                itemContainerStyle={{ marginLeft: 0, paddingLeft: 0,  left: 0}}
                value={field.value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    helpers.setValue(item.value);
                    setIsFocus(false);     
                }}
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
      justifyContent: 'center',
      alignContent: 'center',
      // alignItems: 'center'
    },
    dropdown: {
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