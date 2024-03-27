import { TextInput, TextInputProps } from "react-native-paper";
import { FieldComponentProps } from "./form-field";
import { useEffect, useRef } from "react";
import { Controller, Path, useController, useWatch } from "react-hook-form";
import { FormEntryV2 } from "../lib/config";

export function TextField({
    config,
    onPress,
    onChange,
    inputProps = {},
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

    return (
        <Controller
            key={`field-${name}`}
            control={control}
            name={name as Path<FormEntryV2>}
            render={({ field }) => (
                <TextInput
                    mode='flat'
                    label={label || `New Field`}
                    value={field.value as string}
                    style={{ 
                        backgroundColor: '#fff', 
                        marginBottom: 10,
                        paddingBottom: 0,
                        borderBottomWidth: 0,
                    }}
                    textColor="#000"
                    placeholderTextColor='#000'
                    selectionColor="#000"
                    underlineStyle={{
                        borderBottomColor: '#ddd',
                        borderBottomWidth: 1
                    }}
                    {...inputProps}
                    onPressIn={e => {
                        onPress();
                    }}
                    onChangeText={field.onChange}
                    disabled={isDisabled}
                    onBlur={field.onBlur}
                />
            )}
        />
        
    )
}