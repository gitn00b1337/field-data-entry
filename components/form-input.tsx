import { Control, Controller, ControllerRenderProps, Path, } from "react-hook-form";
import { NativeSyntheticEvent, StyleSheet, TextInputEndEditingEventData, } from "react-native";
import { MD3Theme, TextInput, TextInputProps, useTheme } from "react-native-paper";
import { FormEntryV2 } from "../lib/config";

export type FormInputProps = TextInputProps & {
    fieldName: string;
    label: string;
    control: Control<FormEntryV2, any>;
    onFieldChange?: (field: ControllerRenderProps<FormEntryV2, any>, text: string) => void
    onFieldBlur?: (field: ControllerRenderProps<FormEntryV2, any>, text: string) => void
} 

export function FormInput({
    fieldName,
    label,
    control,
    style,
    onFieldChange,
    onFieldBlur,
    ...textInputProps
}: FormInputProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    function handleOnChange(field: ControllerRenderProps<FormEntryV2, any>, text: string) {
        if (typeof onFieldChange === 'function') {
            console.log(`onFieldChange: ${text}`)
            onFieldChange(field, text);
        }
        else {
            field.onChange(text)
        }
    }

    function handleBlur(field: ControllerRenderProps<FormEntryV2, any>, e: NativeSyntheticEvent<TextInputEndEditingEventData>) {
        if (typeof onFieldBlur === 'function') {
            console.log(`onFieldBlur: ${e.nativeEvent.text}`)
            onFieldBlur(field, e.nativeEvent.text);
        }
    }
    
    return (
        <Controller
            key={`field-${fieldName}`}
            name={fieldName as Path<FormEntryV2>}
            control={control}
            render={({ field, fieldState: { error }}) => (
                <TextInput
                    label={label}
                    value={String(field?.value)}
                    onChangeText={text => handleOnChange(field, text)}
                    style={[styles.field, style]}
                    mode='flat'
                    outlineColor={theme.colors.outline}
                    textColor={theme.colors.onSurface}
                    onEndEditing={(e) => handleBlur(field, e)}
                    {...textInputProps}
                />
            )}
        />
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    field: {
        backgroundColor: '#fff', 
        flexGrow: 1,
        marginBottom: 12,
    }
});