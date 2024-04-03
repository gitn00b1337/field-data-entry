import { IconButton, SegmentedButtons, Text, TextInput, TextInputProps } from "react-native-paper";
import { FieldComponentProps } from "./form-field";
import { useEffect, useRef } from "react";
import { Controller, Path, useWatch } from "react-hook-form";
import { FormEntryV2 } from "../lib/config";
import { StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export function FormTallyField({
    config,
    onPress,
    onChange,
    isDisabled,
    control,
}: FieldComponentProps & { inputProps?: TextInputProps }) {
    const {
        label,
        name,
    } = config;
    
    const valueChanged = useRef(false);

    const val = useWatch({
        control,
        name: name as Path<FormEntryV2>
    })

    useEffect(() => {
        // if it's not the first render and the value has changed, then trigger
        // cant do it on the actual event as it triggers form triggers
        // which use the values object, which is then one change event behind
        if (   valueChanged.current 
            && typeof onChange === 'function'
        ) {
            onChange(val);
        } 

        // stopping first render causing an onChange trigger
        valueChanged.current = true;
    }, [ val ]);

    function handleAddPress(callback: (newVal: number) => void) {
        const value = Number(val);
        let newVal = 0;

        if (!isNaN(value)) {
            newVal = value + 1;
        }

        callback(newVal);
    }

    function handleSubtractPress(callback: (newVal: number) => void) {
        const value = Number(val);
        let newVal = 0;

        if (!isNaN(value) && value > 0) {
            newVal = value - 1;
        }

        callback(newVal);
    }

    function handleValueChange(btnValue: string, callback: (newVal: number) => void) {
        // if (isDisabled) {
        //     return;
        // }

        switch (btnValue) {
            case '+': return handleAddPress(callback);
            case '-': return handleSubtractPress(callback);
            default: return;
        }
    }

    return (
        <Controller
            key={`field-${name}`}
            control={control}
            name={name as Path<FormEntryV2>}
            render={({ field }) => (
                <View style={{ flexGrow: 1, alignItems: 'flex-end', }}>
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>{ label || 'New Field' }</Text>
                    </View>
                    <View style={{ flexGrow: 1,}} />
                    <View style={styles.container}>
                    <TouchableOpacity
                            style={styles.leftBtn}
                            onPress={() => {
                                handleValueChange('-', field.onChange);
                                onPress();
                            }}
                        >
                            <IconButton
                                icon='minus'
                                size={18}
                                style={styles.icon}
                            />
                    </TouchableOpacity>
                    <View style={styles.valueContainer}>
                        <Text style={styles.value}>{ (val as string) || '0' }</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.rightBtn}
                        onPress={() => {
                            handleValueChange('+', field.onChange);
                            onPress();
                        }}
                    >
                        <IconButton
                            icon='plus'
                            size={18}
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
                </View>
                
            )}
        />
        
    )
}

const styles = StyleSheet.create({
    labelContainer: {
        position: 'absolute',
        top: 8,
        left: 16,
        zIndex: -1,
    },
    label: {
        fontSize: 12,
    },
    leftBtn: {
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
    },
    rightBtn: {
        borderColor: '#DDD',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
    },
    valueContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
        paddingRight: 4,
    },
    value: {
        fontSize: 16,
    },
    icon: {
        margin: 0,
        padding: 0,

    },
    container: {
        borderColor: '#DDDDDD',
        borderBottomWidth: 1,
        marginBottom: 10,
        flexDirection: 'row',   
        paddingBottom: 4, 
        height: 56,
        paddingTop: 21,
        paddingHorizontal: 6,
    },
    buttonStyle: {
        backgroundColor: 'white',
    }
})