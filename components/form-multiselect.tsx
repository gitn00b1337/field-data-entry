import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { MultiSelect, } from 'react-native-element-dropdown';
import { MD3Theme, useTheme } from "react-native-paper";
import { deferredEffect } from "../lib/effect";
import { Control, Controller, Path, useWatch } from "react-hook-form";
import { FormEntryV2 } from "../lib/config";
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

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
    isDisabled?: boolean;
    control: Control<FormEntryV2, any>;
}

export function FormMultiSelectField({
    fieldName,
    label,
    options,
    onFocus,
    hasAllOption = false,
    allOptionLabel = 'All Options',
    onChange,
    control,
}: FormMultiSelectFieldProps) {
    const [isFocus, setIsFocus] = useState(false);

    const theme = useTheme();
    const styles = makeStyles(theme);

    const val = useWatch({
        control,
        name: fieldName as Path<FormEntryV2>
    });

    useEffect(() => {
        if (isFocus && onFocus) {
            onFocus();
        }
    }, [isFocus]);


    deferredEffect(() => {
        if (typeof onChange === 'function') {
            onChange((val as string)?.split(','));
        }
    }, [val]);

    function getPlaceholder(fieldValue: any) {
        if (hasAllOption && !fieldValue?.length) {
            return allOptionLabel;
        }

        const value = getValue(fieldValue);

        if (value.length < 1) {
            return '';
        }

        return options.filter(op => value?.indexOf(op.value) > -1)
            .reduce((str, op, index) => {
                if (index === 0) {
                    return op.label;
                }

                return `${str}, ${op.label}`;
            }, '')
    }

    function getValue(fieldValue: any): string[] {
        if (typeof fieldValue === 'string') {
            return fieldValue?.split(',');
        }
        else if (Array.isArray(fieldValue)) {
            return fieldValue;
        }

        return [];
    }

    const animationDuration = 200;

    const labelStyles = useAnimatedStyle(() => {
      if (typeof val === 'string' && val.length > 0) {
        // if has a value, position top left
        return {
          top: withTiming(3, { duration: animationDuration }),
          left: withTiming(16, { duration: animationDuration }),
        }
      } 
  
      return {
        top: withTiming(19, { duration: animationDuration }),
        left: withTiming(16, { duration: animationDuration }),
      }
    }, [ val ]);
  
    const labelTextStyles = useAnimatedStyle(() => {
      if (typeof val === 'string' && val.length > 0) {
        return { 
          fontSize: withTiming(12, { duration: animationDuration }),
        }
      }
  
      return { 
        fontSize: withTiming(16, { duration: animationDuration }),
      }
    }, [ val ]);
    
    return (
        <View style={styles.border}>
            <View style={{ flexGrow: 1, }} />
            <View style={styles.container}>
            <Animated.View style={[{
                width: '100%',
                position: 'absolute',
                zIndex: -100
            }, labelStyles ]}>
                <Animated.Text
                    style={labelTextStyles}
                >
                    {label || 'New Field'}
                </Animated.Text>
            </Animated.View>  
                <View style={{ width: '100%', flexGrow: 1 }}>
                <Controller
                    key={`field-${fieldName}`}
                    name={fieldName as Path<FormEntryV2>}
                    control={control}
                    render={({ field, fieldState }) => (
                        <MultiSelect
                            style={[styles.dropdown, isFocus && { borderColor: theme.colors.primary }]}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            containerStyle={styles.dropdownContainer}
                            iconStyle={styles.iconStyle}
                            data={options}
                            search
                            maxHeight={300}
                            labelField={'label'}
                            valueField={'value'}
                            placeholder={getPlaceholder(field?.value)}
                            searchPlaceholder="Search..."
                            itemContainerStyle={{ marginLeft: 0, paddingLeft: 0, left: 0 }}
                            value={getValue(field?.value)}
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={values => {
                                field?.onChange(values?.join(','));
                                setIsFocus(false);
                            }}
                            visibleSelectedItem={false}
                        />
                    )}
                />
                </View>

            </View>
        </View>
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    border: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD',
        flexGrow: 1,
        marginBottom: 10,
    },
    container: {
        backgroundColor: 'white',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        position: 'relative',
    },
    dropdownContainer: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    dropdown: {
        marginBottom: 0,
        zIndex: 100,
        paddingBottom: 8,
        paddingTop: 12,
        paddingHorizontal: 4,
    },
    icon: {
        marginRight: 5,
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
        fontSize: 16,
        borderRadius: 2,
    },
});