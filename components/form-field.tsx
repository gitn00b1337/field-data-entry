import { StyleSheet, TouchableOpacity, } from "react-native";
import { MD3Theme, useTheme } from "react-native-paper";
import { FormFieldV2 } from "../lib/config";
import { FormSelectField } from "./form-select";
import { FormMultiSelectField } from "./form-multiselect";
import { CheckboxField } from "./form-checkbox";
import { TextField } from "./form-text-field";
import { NumericField } from "./form-numeric-field";
import { WholeNumberField } from "./form-wholenumber-field";

export type FormFieldProps = {
    config: FormFieldV2;
    onPress?: () => void;
    onChange?: (field: FormFieldV2, value: any) => void;
}

export type FieldComponentProps = {
    onChange: (val: any) => void;
} & Omit<FormFieldProps, 'onChange'>;

export function FormField({
    onChange,
    ...props
}: FormFieldProps) {
    const theme = useTheme();
    const styles = makeStyles(theme);

    function handleChange(val: any) {
        if (typeof onChange === 'function') {
            onChange(props.config, val);
        }
    }

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={props.onPress}
        >
            <FieldComponent 
                {...props} 
                config={{
                    ...props.config,
                    name: `values.${props.config.entryKey}.value`,
                }}
                onChange={handleChange} 
            />
        </TouchableOpacity>
    )
}

function FieldComponent(props : FieldComponentProps) {
    switch (props.config.type) {
        case 'TEXT': return <TextField {...props} />;
        case 'SELECT': return (
            <FormSelectField 
                fieldName={`${props.config.name}`}
                label={props.config.label}
                options={props.config.options}
                onFocus={props.onPress}
                onChange={props.onChange}
            />
        );
        case 'MULTI_SELECT': return (
            <FormMultiSelectField 
                fieldName={`${props.config.name}`}
                label={props.config.label}
                options={props.config.options}
                onFocus={props.onPress}
                onChange={props.onChange}
            />
        )
        case 'NUMERIC': return <NumericField {...props} />;
        case 'WHOLE_NUMBER': return <WholeNumberField {...props} />;
        case 'CHECKBOX': return <CheckboxField {...props} />; 
        default: 
            console.error(`Field type ${props.config.type} not supported`);
            return null;
    }
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexGrow: 1,
        position: 'relative',
    },
    sectionBtnContainer: {
        alignItems: 'flex-end',
    },
    field: {
        backgroundColor: '#fff',
    },
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-evenly',
        alignContent: 'stretch',
        columnGap: 12,
    },
    formSectionBtn: {
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
        maxWidth: 150,
        marginBottom: 12,
    },
    formSectionBtnLabel: {
        textTransform: 'uppercase',
        fontWeight: '900',
        color: theme.colors.onBackground,
    },
});

