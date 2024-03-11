import { TextInput, TextInputProps } from "react-native-paper";
import { FieldComponentProps } from "./form-field";
import { useEffect, useRef } from "react";
import { Path, useController } from "react-hook-form";
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

    const {
        field,
        fieldState,
    } = useController({
        name: config.name as Path<FormEntryV2>,
        control,
    });
    
    const valueChanged = useRef(false);

    useEffect(() => {
        // if it's not the first render and the value has changed, then trigger
        // cant do it on the actual event as it triggers form triggers
        // which use the values object, which is then one change event behind
        if (   valueChanged.current 
            && typeof onChange === 'function'
        ) {
            onChange(field.value);
        } 

        console.log('ON CHANGE')
        // stopping first render causing an onChange trigger
        valueChanged.current = true;
    }, [ field.value ]);

    return (
        <TextInput
            label={label || `New Field`}
            value={field.value as string}
            style={{ 
                backgroundColor: '#fff', 
                marginBottom: 0,
                paddingBottom: 0,
            }}
            {...inputProps}
            onPressIn={e => {
                onPress();
            }}
            onChangeText={field.onChange}
            disabled={isDisabled}
            onBlur={field.onBlur}
        />
    )
}