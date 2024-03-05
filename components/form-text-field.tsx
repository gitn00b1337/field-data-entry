import { TextInput, TextInputProps } from "react-native-paper";
import { FieldComponentProps } from "./form-field";
import { useEffect, useRef } from "react";
import { useField } from "formik";

export function TextField({
    config,
    onPress,
    onChange,
    inputProps = {},
    isDisabled,
}: FieldComponentProps & { inputProps?: TextInputProps }) {
    const {
        label,
        name,
    } = config;

    const [field, meta, helpers] = useField(name);
    const valueChanged = useRef(false);

    function handleChange(val: string) {
        helpers.setValue(val, false);
        helpers.setTouched(true, false);
    }

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
            value={field.value}
            style={{ 
                backgroundColor: '#fff', 
                marginBottom: 0,
                paddingBottom: 0,
            }}
            {...inputProps}
            onPressIn={e => {
                helpers.setTouched(true, true);
                onPress();
            }}
            onChangeText={handleChange}
            disabled={isDisabled}
            onBlur={() => helpers.setTouched(true, true)}
        />
    )
}