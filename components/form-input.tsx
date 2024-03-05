import { StyleSheet,} from "react-native";
import { MD3Theme, TextInput, TextInputProps, useTheme } from "react-native-paper";
import { useField, } from 'formik';

export type FormInputProps = {
    fieldName: string;
    label: string;
} & TextInputProps

export function FormInput({
    fieldName,
    label,
    ...textInputProps
}: FormInputProps) {
    const theme = useTheme();
    const [field, meta, helpers] = useField(fieldName);
    const styles = makeStyles(theme);

    return (
        <TextInput
            label={label}
            value={field.value}
            onChangeText={text => helpers.setValue(text)}
            style={styles.field}
            mode='flat'
            outlineColor={theme.colors.outline}
            textColor={theme.colors.onSurface}
            {...textInputProps}
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