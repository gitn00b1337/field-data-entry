import { Control, Controller, Path, useController, useWatch } from "react-hook-form";
import { StyleSheet,} from "react-native";
import { MD3Theme, TextInput, TextInputProps, useTheme } from "react-native-paper";
import { FormEntryV2 } from "../lib/config";

export type FormInputProps = {
    fieldName: string;
    label: string;
    control: Control<FormEntryV2, any>;
} & TextInputProps

export function FormInput({
    fieldName,
    label,
    control,
    ...textInputProps
}: FormInputProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    
    return (
        <Controller
            key={`field-${fieldName}`}
            name={fieldName as Path<FormEntryV2>}
            control={control}
            render={({ field, fieldState: { error }}) => (
                <TextInput
                    label={label}
                    value={field?.value as string}
                    onChangeText={text => field.onChange(text)}
                    style={styles.field}
                    mode='flat'
                    outlineColor={theme.colors.outline}
                    textColor={theme.colors.onSurface}
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