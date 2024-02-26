import { TextInput, TextInputProps } from "react-native-paper";
import { FieldComponentProps } from "./form-field";
import { useEffect, useRef } from "react";
import { useField } from "formik";

export function TextField({
    config,
    onPress,
    onChange,
    inputProps = {},
}: FieldComponentProps & { inputProps?: TextInputProps }) {
    const {
        label,
        name,
    } = config;

    const [field, meta, helpers] = useField(name);
    const valueChanged = useRef(false);

    useEffect(() => {
        console.log(meta.touched)
        if (valueChanged.current 
            && typeof onChange === 'function'
            && meta.touched
        ) {
            onChange(field.value);
        } 

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
            onChangeText={v => {
                helpers.setValue(v);
                helpers.setTouched(true, true);
            }}
        />
    )
}