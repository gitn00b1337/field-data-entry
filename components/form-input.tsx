import { StyleSheet } from "react-native";
import { MD3Theme, TextInput, TextInputProps, useTheme } from "react-native-paper";
import { useField, Form, FormikProps, Formik } from 'formik';

export type FormInputProps = {
    fieldName: string;
    value: string;
    label: string
} & TextInputProps

export function FormInput({
    fieldName,
    value,
    label,
    ...textInputProps
}: FormInputProps) {
    const theme = useTheme();
    const [field, meta, helpers] = useField(fieldName);
    const styles = makeStyles(theme);

    return (
        <TextInput
            label={label}
            value={value}
            onChangeText={text => helpers.setValue(text)}
            style={styles.field}
            mode='outlined'
            outlineColor={theme.colors.outline}
            textColor={theme.colors.onSurface}
            {...textInputProps}
        />
    )
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    field: {
        marginBottom: 12,
        justifyContent: 'flex-start',
        // maxWidth: 400,
    }
});